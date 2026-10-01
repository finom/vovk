import os
import json
import requests
from urllib.parse import quote
import jsonschema
from jsonschema import FormatChecker
from requests.models import Response
from typing import Dict, Optional, Any, Generator, Literal, List, Tuple, TypedDict

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

class ApiClient:
    @staticmethod
    def _load_full_schema() -> Dict[str, Any]:    
        """
        Loads the 'schema.json' file from the ./src/ directory.
        Returns it as a Python dictionary.
        """
        current_dir = os.path.dirname(__file__)
        schema_path = os.path.join(current_dir, "schema.json")
        with open(schema_path, "r", encoding="utf-8") as f:
            return json.load(f)

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

    def _segment_base(self, segment_name: str) -> Tuple[str, str]:
        if segment_name in self.segments:
            return self.segments[segment_name]
        # a mixin's URLs start at the server of its API, without a segment name
        force_api_root = self.full_schema['segments'][segment_name].get('forceApiRoot')
        return (force_api_root, '') if force_api_root else (self.api_root, segment_name)

    @staticmethod
    def _join_url(root: str, *parts: str) -> str:
        # a slash at the end of the root or around a part must not double the one the join adds
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
        # Extract relevant information from the full schema
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
            
        Raises:
            ValueError: If validation fails or required parameters are missing
            HttpException: If the response status is 400 or higher
            requests.RequestException: If the request fails
        """
        if not url:
            raise ValueError("URL is required for making an API request")
        if not http_method:
            raise ValueError("HTTP method is required for making an API request")
        TIsForm = False
        TIsText = body_content_type is not None and body_content_type.startswith('text/')
        TIsBinary = body_content_type is not None and not TIsText
        # Validate inputs if validation schema is provided
        if validation and not disable_client_validation:
            # Always use format checker by default
            format_checker = FormatChecker()
            # Validate body (skip for form data and binary data since they can't be validated client-side)
            body_content_types = validation.get('body', {}).get('x-contentType', [])
            is_form = 'multipart/form-data' in body_content_types or 'application/x-www-form-urlencoded' in body_content_types
            if validation.get('body') and not is_form and not TIsBinary:
                if body is None:
                    raise ValueError("Body is required for validation but not provided")
                jsonschema.validate(instance=body, schema=validation['body'], format_checker=format_checker)
            
            # Validate query
            if validation.get('query'):
                if query is None:
                    raise ValueError("Query is required for validation but not provided")
                jsonschema.validate(instance=query, schema=validation['query'], format_checker=format_checker)
            
            # Validate params
            if validation.get('params'):
                if params is None:
                    raise ValueError("Params are required for validation but not provided")
                jsonschema.validate(instance=params, schema=validation['params'], format_checker=format_checker)

        TIsMultipart = False
        if validation and validation.get('body'):
            body_ct = validation['body'].get('x-contentType', [])
            if 'multipart/form-data' in body_ct or 'application/x-www-form-urlencoded' in body_ct:
                TIsForm = True
            if 'multipart/form-data' in body_ct:
                TIsMultipart = True

        # Process URL and substitute path parameters
        processed_url = url
        if params:
            for key, value in params.items():
                text = str(value)
                # "", "." and ".." would drop or climb a path segment and so reach another route
                if text in ('', '.', '..'):
                    raise ValueError(f'Path parameter "{key}" cannot be empty, "." or "..", got "{text}"')
                processed_url = processed_url.replace(f"{{{key}}}", quote(text, safe=''))
        
        # Process query parameters if present
        if query:
            query_string = self._build_query_string(query)
            if "?" in processed_url:
                processed_url += "&" + query_string
            else:
                processed_url += "?" + query_string
        
        # Prepare headers
        request_headers = {
            'Accept': 'application/jsonl, application/json'
        }
        
        # Update with custom headers if provided
        if headers:
            request_headers.update(headers)
        
        response: Response
        if TIsText:
            request_headers['Content-Type'] = body_content_type # type: ignore
            response = requests.request(
                method=http_method.upper(),
                url=processed_url,
                headers=request_headers,
                data=body.encode('utf-8') if isinstance(body, str) else body,
                stream=True # Always stream for consistent handling
            )
        elif TIsBinary:
            request_headers['Content-Type'] = body_content_type # type: ignore
            response = requests.request(
                method=http_method.upper(),
                url=processed_url,
                headers=request_headers,
                data=body,
                stream=True # Always stream for consistent handling
            )
        elif TIsForm and isinstance(body, dict):
            fields = self._to_form_fields(body)
            if TIsMultipart:
                # a (None, text) part is a plain field, and makes requests send multipart even without a file
                file_parts = list(files.items()) if isinstance(files, dict) else list(files or [])
                response = requests.request(
                    method=http_method.upper(),
                    url=processed_url,
                    headers=request_headers,
                    files=[(key, (None, text)) for key, text in fields] + file_parts,
                    stream=True # Always stream for consistent handling
                )
            else:
                response = requests.request(
                    method=http_method.upper(),
                    url=processed_url,
                    headers=request_headers,
                    files=files,
                    data=fields,
                    stream=True # Always stream for consistent handling
                )
        elif TIsForm:
            response = requests.request(
                method=http_method.upper(),
                url=processed_url,
                headers=request_headers,
                files=files,
                data=body,
                stream=True # Always stream for consistent handling
            )
        else:
            response = requests.request(
                method=http_method.upper(),
                url=processed_url,
                headers=request_headers,
                json=body,
                stream=True # Always stream for consistent handling
            )

        # Handle response based on content type
        content_type = response.headers.get('Content-Type', '')

        if response.status_code >= 400:
            raise self._to_http_exception(response, content_type)

        if 'application/jsonl' in content_type:
            return self._stream_jsonl(response)

        elif 'application/json' in content_type:
            # an empty body, such as a 204 answer has, holds no value
            return response.json() if response.content else None

        # Default to returning raw content if content type is not recognized
        return response.text

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
        message = envelope.get('message')
        return HttpException({
            'message': message if isinstance(message, str) else text or response.reason or 'Unknown error',
            'statusCode': response.status_code,
            'isError': True,
            'cause': envelope.get('cause'),
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
                if isinstance(item, bool):
                    text = 'true' if item else 'false'
                elif isinstance(item, (dict, list, tuple)):
                    text = json.dumps(item, separators=(',', ':'), ensure_ascii=False)
                else:
                    text = str(item)
                fields.append((key, text))
        return fields

    def _build_query_string(self, data: dict[str, Any], prefix: str = '') -> str:
        """
        Build a query string from a nested dictionary or list.
        Handles complex nested structures with the specified format.
        
        Args:
            data: The data to convert to a query string
            prefix: The prefix for the current level of nesting
            
        Returns:
            The formatted query string
        """
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
            # booleans as JSON writes them, the way the TypeScript client sends them
            text = ('true' if data else 'false') if isinstance(data, bool) else str(data)
            return f"{quote(prefix, safe='')}={quote(text, safe='')}"
        
        return "&".join(part for part in parts if part)

    def _stream_jsonl_items(self, response: requests.Response) -> Generator[Dict[str, Any], None, None]:
        """
        Process a streaming JSONL response.
        Handles cases where lines might be split across response chunks.
        
        Args:
            response: The response object with a streaming JSONL body
            
        Yields:
            Each parsed JSON object from the response
        """
        buffer = ""
        
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                buffer += chunk
                lines = buffer.split('\n')
                
                # Process all complete lines
                for i in range(len(lines) - 1):
                    line = lines[i].strip()
                    if line:
                        yield self._parse_jsonl_line(line)
                
                # Keep the last (potentially incomplete) line in the buffer
                buffer = lines[-1]
        
        # Process any remaining data in buffer, a stream cut inside its last line fails here
        if buffer.strip():
            yield self._parse_jsonl_line(buffer.strip())

    @staticmethod
    def _parse_jsonl_line(line: str) -> Any:
        # a skipped line would make a broken stream look complete
        try:
            return json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f'Malformed JSON line in the stream: {line[:200]!r}') from error
            
    def _stream_jsonl(self, response: requests.Response) -> Generator[Dict[str, Any], None, None]:
        """
        Stream JSONL data from a response.
        
        Args:
            response: The response object with a streaming JSONL body
            
        Yields:
            Each parsed JSON object from the response
        """
        for item in self._stream_jsonl_items(response):
            if self._is_error_line(item):
                reason = item['reason']
                status_code = item.get('statusCode')
                if isinstance(reason, str) and isinstance(status_code, int):
                    raise HttpException({'message': reason, 'statusCode': status_code, 'isError': True, 'cause': None})
                raise Exception(reason if isinstance(reason, str) else json.dumps(reason))
            yield item

    @staticmethod
    def _is_error_line(item: Any) -> bool:
        # only the envelope a responder writes ends the stream, not a data item that happens to have these keys
        return (
            isinstance(item, dict)
            and item.get('isError') is True
            and 'reason' in item
            and set(item.keys()) <= {'isError', 'reason', 'statusCode'}
        )