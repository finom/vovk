import io
import os
import re
import json
import codecs
import functools
import requests
from http.cookiejar import DefaultCookiePolicy
from urllib.parse import quote
from jsonschema import FormatChecker, validators
from jsonschema.exceptions import ValidationError, best_match
from requests.models import Response
from urllib3.exceptions import DecodeError, ProtocolError, ReadTimeoutError, SSLError
from typing import Dict, Optional, Any, Generator, Iterator, Literal, List, Tuple, TypedDict, Union

class _Blocks(io.BytesIO):
    # http.client and urllib3 read a file body 8 or 16 KB at a time; 256 KB blocks keep the timeout per block and the
    # rewind after a redirect, with far fewer sends
    def read(self, size: Optional[int] = -1) -> bytes:
        return super().read(max(size, 256 * 1024) if size and size > 0 else size)

class HttpExceptionResponseBody(TypedDict):
    cause: Any
    statusCode: int
    message: str
    isError: bool

class HttpException(Exception):
    def __init__(self, response_body: HttpExceptionResponseBody):
        super().__init__(response_body['message'])
        self.message = response_body['message']
        self.status_code = response_body['statusCode']
        self.cause = response_body.get('cause')

    def __reduce__(self) -> Any:
        # pickled, as a process pool sends it, or copied: made again from its body, not from the message alone
        body: HttpExceptionResponseBody = {'message': self.message, 'statusCode': self.status_code, 'isError': True, 'cause': self.cause}
        return (type(self), (body,), self.__dict__)

_JSON_LINES_MEDIA_TYPES = ('application/jsonl', 'application/jsonlines', 'application/x-ndjson')

_FORM_MEDIA_TYPES = ('multipart/form-data', 'application/x-www-form-urlencoded')

def _is_json_media_type(media_type: str) -> bool:
    return media_type == 'application/json' or media_type.endswith('+json')

def _charset(content_type: str) -> Optional[str]:
    for parameter in content_type.split(';')[1:]:
        name, _, value = parameter.partition('=')
        if name.strip().lower() == 'charset':
            return value.strip().strip('"\'') or None
    return None

def _binary_content_type(declared: List[str]) -> str:
    # bytes go out as the first type the procedure declares that isn't JSON or a form, such as image/png
    concrete = (t for t in declared if '*' not in t and t not in _FORM_MEDIA_TYPES and not _is_json_media_type(t))
    wildcard = (t for t in declared if t != '*/*' and t.endswith('/*'))
    return next(concrete, None) or next(wildcard, None) or 'application/octet-stream'

def _to_text(value: Any) -> str:
    # a scalar as JavaScript writes it: true and false, and a whole number without .0
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, float) and value.is_integer() and abs(value) < 2 ** 53:
        return str(int(value))
    return str(value)

@functools.lru_cache(maxsize=None)
def _compile_pattern(pattern: str) -> Optional['re.Pattern[str]']:
    try:
        return re.compile(pattern)
    except re.error:
        return None

def _pattern(validator: Any, pattern: str, instance: Any, schema: Dict[str, Any]) -> Iterator[ValidationError]:
    # schema patterns are JavaScript ones: what Python's re can't read, such as \p{L} or a named group, the server checks
    compiled = _compile_pattern(pattern)
    if validator.is_type(instance, 'string') and compiled is not None and not compiled.search(instance):
        yield ValidationError(f'{instance!r} does not match {pattern!r}')

@functools.lru_cache(maxsize=None)
def _validator_class(base: Any) -> Any:
    return validators.extend(base, {'pattern': _pattern})

def _validate(instance: Any, schema: Dict[str, Any]) -> None:
    # unlike jsonschema.validate, the schema itself isn't checked: that check reads its patterns with Python's re
    validator = _validator_class(validators.validator_for(schema))(schema, format_checker=FormatChecker())
    try:
        error = best_match(validator.iter_errors(instance))
    except re.error:
        # another place a pattern sits, such as a patternProperties key: the server checks this value
        return
    if error is not None:
        raise error

class ApiClient:
    @staticmethod
    def _load_full_schema() -> Dict[str, Any]:    
        current_dir = os.path.dirname(__file__)
        schema_path = os.path.join(current_dir, "schema.json")
        with open(schema_path, "r", encoding="utf-8") as f:
            schema: Dict[str, Any] = json.load(f)
            return schema

    def __init__(self, api_root: str, segments: Optional[Dict[str, Tuple[str, str]]] = None):
        """
        Initialize the API client with a base URL.

        Args:
            api_root: The base URL for all API requests
            segments: Per segment, the root its URLs start with and the segment's path after that root
        """
        self.api_root = api_root
        self.segments = segments or {}
        self.full_schema: Dict[str, Any] = ApiClient._load_full_schema()
        # one session keeps connections open between calls; set headers, auth or adapters on it
        self.session = requests.Session()
        # every call and thread shares the session: a cookie a response sets isn't kept for later calls, one set by hand is
        self.session.cookies.set_policy(DefaultCookiePolicy(allowed_domains=[]))
        # seconds to connect and to wait for each read, as requests takes it; None waits forever
        self.timeout: Union[None, float, Tuple[float, float]] = (10, 300)

    def _segment_base(self, segment_name: str) -> Tuple[str, str]:
        if segment_name in self.segments:
            return self.segments[segment_name]
        # a mixin's URLs start at the server of its API, without a segment name
        force_api_root = self.full_schema['segments'][segment_name].get('forceApiRoot')
        return (force_api_root, '') if force_api_root else (self.api_root, segment_name)

    @staticmethod
    def _join_url(root: str, *parts: str) -> str:
        return '/'.join(part for part in [root.rstrip('/'), *(part.strip('/') for part in parts)] if part)

    def request(
        self,
        segment_name: str,
        rpc_name: str,
        handler_name: str,
        api_root: Optional[str],
        body: Optional[Any] = None,
        query: Optional[Any] = None,
        params: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
        files: Optional[Any] = None,
        body_content_type: Optional[str] = None,
        disable_client_validation: bool = False
    ) -> Any:
        """
        Make an API request based on a full schema and controller/handler
        configuration.
        """
        schema = self.full_schema['segments'][segment_name]
        controller = schema['controllers'][rpc_name]
        handlers = controller['handlers']
        handler = handlers[handler_name]
        http_method = handler['httpMethod']
        validation = handler.get('validation', {})

        default_root, segment_path = self._segment_base(segment_name)
        url = self._join_url(api_root or default_root, segment_path, controller.get('prefix') or '', handler['path'])

        return self.make_api_request(
            url=url,
            http_method=http_method,
            body=body,
            query=query,
            params=params,
            headers=headers,
            validation=validation,
            files=files,
            body_content_type=body_content_type,
            disable_client_validation=disable_client_validation,
        )
        
    def make_api_request(
        self,
        url: str,
        http_method: Literal['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        body: Optional[Any] = None,
        query: Optional[Any] = None,
        params: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
        files: Optional[Any] = None,
        validation: Optional[Dict[str, Any]] = None,
        body_content_type: Optional[str] = None,
        disable_client_validation: bool = False,
    ) -> Any:
        """
        Make an API request with optional validation and parameter handling.
        
        Args:
            url: The URL to make the request to
            http_method: HTTP method (GET, POST, PUT, DELETE, etc.)
            body: Optional dictionary to send as JSON in the request body
            query: Optional dictionary to convert to query parameters
            params: Optional dictionary to replace URL parameters
            headers: Optional dictionary of custom headers
            validation: Optional dictionary with JSON schemas to validate body, query, and params
            body_content_type: Optional content type for the body (e.g. 'text/plain', 'application/octet-stream')
            disable_client_validation: Whether to disable validation entirely
            
        Returns:
            If the response is JSON, returns the parsed JSON.
            If the response is JSONL, returns a generator yielding each parsed line.
            If the response is text/* or names a charset, returns the text as str, UTF-8 unless the charset says otherwise.
            Otherwise, as for a file, returns the bytes.
            
        Raises:
            ValueError: If validation fails or required parameters are missing
            HttpException: If the response status is 400 or higher
            requests.RequestException: If the request fails
        """
        if not url:
            raise ValueError("URL is required for making an API request")
        if not http_method:
            raise ValueError("HTTP method is required for making an API request")
        body_ct: List[str] = validation['body'].get('x-contentType', []) if validation and validation.get('body') else []
        if body_content_type is None and isinstance(body, (bytes, bytearray)):
            # bytes for a body that also takes JSON, such as a file or an object: the file goes out as is
            body_content_type = _binary_content_type(body_ct)
        # a declared text type such as application/xml is text too: a str body is text, bytes are binary
        TIsText = body_content_type is not None and isinstance(body, str)
        TIsBinary = body_content_type is not None and not TIsText
        # an object goes out as a form only when JSON can't carry it: no JSON declared, or files to send
        TIsForm = any(t in _FORM_MEDIA_TYPES for t in body_ct) and bool(files or not any(_is_json_media_type(t) for t in body_ct))
        TIsMultipart = TIsForm and 'multipart/form-data' in body_ct
        if validation and not disable_client_validation:
            # a form or binary body is left to the server
            if validation.get('body') and not TIsForm and not TIsBinary:
                if body is None:
                    raise ValueError("Body is required for validation but not provided")
                _validate(body, validation['body'])

            if validation.get('query'):
                if query is None:
                    raise ValueError("Query is required for validation but not provided")
                _validate(query, validation['query'])

            if validation.get('params'):
                if params is None:
                    raise ValueError("Params are required for validation but not provided")
                _validate(params, validation['params'])

        processed_url = url
        if params:
            for key, value in params.items():
                text = _to_text(value)
                # "", "." and ".." would drop or climb a path segment and so reach another route
                if text in ('', '.', '..'):
                    raise ValueError(f'Path parameter "{key}" cannot be empty, "." or "..", got "{text}"')
                processed_url = processed_url.replace(f"{{{key}}}", quote(text, safe=''))
        
        if query:
            query_string = self._build_query_string(query)
            if "?" in processed_url:
                processed_url += "&" + query_string
            else:
                processed_url += "?" + query_string
        
        request_headers = {
            'Accept': 'application/jsonl, application/json'
        }
        
        if headers:
            request_headers.update(headers)
        
        # the body as requests takes it: data, files or json
        payload: Dict[str, Any]
        if TIsText:
            request_headers['Content-Type'] = body_content_type # type: ignore
            payload = {'data': body.encode('utf-8') if isinstance(body, str) else body}
        elif TIsBinary:
            request_headers['Content-Type'] = body_content_type # type: ignore
            payload = {'data': body}
        elif TIsForm and isinstance(body, dict):
            fields = self._to_form_fields(body)
            if TIsMultipart:
                # a (None, text) part is a plain field, and makes requests send multipart even without a file
                file_parts = list(files.items()) if isinstance(files, dict) else list(files or [])
                payload = {'files': [(key, (None, text)) for key, text in fields] + file_parts}
            else:
                payload = {'files': files, 'data': fields}
        elif TIsForm:
            payload = {'files': files, 'data': body}
        else:
            payload = {'json': body}

        prepared = self.session.prepare_request(
            requests.Request(method=http_method.upper(), url=processed_url, headers=request_headers, **payload)
        )
        if isinstance(prepared.body, (bytes, bytearray)) and prepared.body:
            # sent in blocks, the connect timeout bounds each block and not the whole upload; as a stream the body
            # also goes out again from its start after a 307 or a 308
            prepared.prepare_body(_Blocks(prepared.body), None)
        # streamed, so a JSON Lines response is read as it comes
        settings = self.session.merge_environment_settings(prepared.url, {}, True, None, None)
        response = self.session.send(prepared, timeout=self.timeout, allow_redirects=True, **settings)

        content_type = response.headers.get('Content-Type', '')

        if response.status_code >= 400:
            raise self._to_http_exception(response, content_type)

        media_type = content_type.split(';')[0].strip().lower()
        if media_type in _JSON_LINES_MEDIA_TYPES:
            return self._stream_jsonl(response)

        if _is_json_media_type(media_type):
            # an empty body, such as a 204 answer has, holds no value
            return response.json() if response.content else None

        # a file comes back as its bytes; text as str, and without a charset text/* is UTF-8, not requests' Latin-1
        charset = _charset(content_type)
        if charset is None and not media_type.startswith('text/'):
            return response.content
        try:
            return response.content.decode(charset or 'utf-8', errors='replace')
        except LookupError:
            return response.content.decode('utf-8', errors='replace')

    @staticmethod
    def _to_http_exception(response: Response, content_type: str) -> HttpException:
        # a proxy's error page or a plain text error has no JSON envelope, its text is the message
        text = response.text
        body: Any = None
        if 'json' in content_type:
            try:
                body = json.loads(text)
            except ValueError:
                pass
        envelope: Dict[str, Any] = body if isinstance(body, dict) else {}
        # as the TypeScript client reads it: the message, else the detail or title of a problem document, else the text
        message = next((envelope[key] for key in ('message', 'detail', 'title') if isinstance(envelope.get(key), str)), None)
        cause = envelope.get('cause')
        return HttpException({
            'message': message if message is not None else text or response.reason or 'Unknown error',
            'statusCode': response.status_code,
            'isError': True,
            'cause': cause if cause is not None else body,
        })

    @staticmethod
    def _to_form_fields(body: Dict[str, Any]) -> List[Tuple[str, str]]:
        # as the TypeScript client sends a form: None is left out, a list is one field per item,
        # a boolean is true or false and any other object is JSON
        fields: List[Tuple[str, str]] = []
        for key, value in body.items():
            for item in value if isinstance(value, (list, tuple)) else [value]:
                if item is None:
                    continue
                if isinstance(item, (dict, list, tuple)):
                    text = json.dumps(item, separators=(',', ':'), ensure_ascii=False)
                else:
                    text = _to_text(item)
                fields.append((key, text))
        return fields

    def _build_query_string(self, data: dict[str, Any], prefix: str = '') -> str:
        parts: List[str] = []
        
        if isinstance(data, dict): # type: ignore
            for key, value in data.items():
                new_prefix = f"{prefix}[{key}]" if prefix else key
                parts.append(self._build_query_string(value, new_prefix))
        
        elif isinstance(data, list): # type: ignore
            # an item that sends nothing, such as None, gives its index to the next one:
            # the server reads indexes with a gap as an object
            for item in data:
                part = self._build_query_string(item, f"{prefix}[{len(parts)}]")
                if part:
                    parts.append(part)
        
        elif data is None:
            return ''

        else:
            text = _to_text(data)
            return f"{quote(prefix, safe='')}={quote(text, safe='')}"
        
        return "&".join(part for part in parts if part)

    def _stream_jsonl_items(self, response: requests.Response) -> Generator[Dict[str, Any], None, None]:
        # the line read so far, in pieces: only each new chunk is split, so a long line costs no more than a short one
        pieces: List[str] = []
        # JSON Lines is UTF-8, and application/x-ndjson comes without a charset that requests could decode it with
        decoder = codecs.getincrementaldecoder('utf-8')(errors='replace')

        for chunk in self._chunks(response):
            *lines, rest = decoder.decode(chunk).split('\n')
            if lines:
                lines[0] = ''.join(pieces) + lines[0]
                pieces = []
                for line in lines:
                    line = line.strip()
                    if line:
                        yield self._parse_jsonl_line(line)
            if rest:
                pieces.append(rest)

        # a stream cut inside its last line fails here
        last = (''.join(pieces) + decoder.decode(b'', final=True)).strip()
        if last:
            yield self._parse_jsonl_line(last)

    @staticmethod
    def _chunks(response: requests.Response) -> Iterator[bytes]:
        # the body as it arrives, also without chunked encoding, where reading 1024 bytes waits for all of them
        read1 = getattr(response.raw, 'read1', None)
        if read1 is None:
            # urllib3 before 2.2 has no read1
            yield from response.iter_content(chunk_size=1024)
            return
        # the errors iter_content raises
        try:
            while True:
                chunk = read1(65536)
                if not chunk:
                    return
                yield chunk
        except ProtocolError as error:
            raise requests.exceptions.ChunkedEncodingError(error)
        except DecodeError as error:
            raise requests.exceptions.ContentDecodingError(error)
        except ReadTimeoutError as error:
            raise requests.exceptions.ConnectionError(error)
        except SSLError as error:
            raise requests.exceptions.SSLError(error)

    @staticmethod
    def _parse_jsonl_line(line: str) -> Any:
        # a skipped line would make a broken stream look complete
        try:
            return json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f'Malformed JSON line in the stream: {line[:200]!r}') from error
            
    def _stream_jsonl(self, response: requests.Response) -> Generator[Dict[str, Any], None, None]:
        # closing gives the connection back to the session, also when iteration stops early
        try:
            for item in self._stream_jsonl_items(response):
                if self._is_error_line(item):
                    reason = item['reason']
                    status_code = item.get('statusCode')
                    if isinstance(reason, str) and isinstance(status_code, int):
                        raise HttpException({'message': reason, 'statusCode': status_code, 'isError': True, 'cause': None})
                    raise Exception(reason if isinstance(reason, str) else json.dumps(reason))
                yield item
        finally:
            response.close()

    @staticmethod
    def _is_error_line(item: Any) -> bool:
        # only the envelope a responder writes ends the stream, not a data item that happens to have these keys
        return (
            isinstance(item, dict)
            and item.get('isError') is True
            and 'reason' in item
            and set(item.keys()) <= {'isError', 'reason', 'statusCode'}
        )