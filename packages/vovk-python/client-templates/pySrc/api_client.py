import os
import json
import requests
import jsonschema
from jsonschema import FormatChecker
from requests.models import Response
from typing import Dict, Optional, Any, Generator, Literal, List, TypedDict

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
        self.cause = 'cause' in response_body and response_body['cause']

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

    def __init__(self, api_root: str):
        """
        Initialize the API client with a base URL and default HTTP method.
        
        Args:
            api_root: The base URL for all API requests
            default_http_method: Default HTTP method to use if not specified
        """
        self.api_root = api_root
        self.full_schema: Dict[str, Any] = ApiClient._load_full_schema()
    
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
        files: Optional[Dict[str, Any]] = None,
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
        prefix = controller['prefix']
        handler_path = handler['path']
        http_method = handler['httpMethod']
        validation = handler.get('validation', {})

        api_root = api_root if api_root else self.api_root

        url = '/'.join(filter(None, [api_root, segment_name, prefix, handler_path]))

        return self.make_api_request(
            url=url,
            http_method=http_method,
            body=body,
            query=query,
            params=params,
            headers=headers,
            validation=validation,
            files=files,
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
        files: Optional[Dict[str, Any]] = None,
        validation: Optional[Dict[str, Any]] = None,
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
            disable_client_validation: Whether to disable validation entirely
            
        Returns:
            If the response is JSON, returns the parsed JSON.
            If the response is JSONL, returns a generator yielding each parsed line.
            
        Raises:
            ValueError: If validation fails or required parameters are missing
            requests.RequestException: If the request fails
        """
        if not url:
            raise ValueError("URL is required for making an API request")
        if not http_method:
            raise ValueError("HTTP method is required for making an API request")
        is_form = False
        # Validate inputs if validation schema is provided
        if validation and not disable_client_validation:
            # Always use format checker by default
            format_checker = FormatChecker()
            # Validate body
            if validation.get('body'):
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

        if validation and validation.get('body') and validation['body'].get('x-formData', False):
            is_form = True

        # Process URL and substitute path parameters
        processed_url = url
        if params:
            for key, value in params.items():
                pattern = f"{{{key}}}"
                processed_url = processed_url.replace(pattern, str(value))
        
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
        if is_form:
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
        
        if 'application/jsonl' in content_type:
            return self._stream_jsonl(response)
        
        elif 'application/json' in content_type:
            result = response.json()
            if 'isError' in result:
                raise HttpException(result)
            return result
        
        # Default to returning raw content if content type is not recognized
        return response.text

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
            for i, item in enumerate(data):
                new_prefix = f"{prefix}[{i}]"
                parts.append(self._build_query_string(item, new_prefix))
        
        else:
            # Handle primitive values
            return f"{prefix}={data}"
        
        return "&".join(parts)

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
                        try:
                            yield json.loads(line)
                        except json.JSONDecodeError:
                            # Skip malformed JSON
                            pass
                
                # Keep the last (potentially incomplete) line in the buffer
                buffer = lines[-1]
        
        # Process any remaining data in buffer
        if buffer.strip():
            try:
                yield json.loads(buffer)
            except json.JSONDecodeError:
                # Skip malformed JSON
                pass
            
    def _stream_jsonl(self, response: requests.Response) -> Generator[Dict[str, Any], None, None]:
        """
        Stream JSONL data from a response.
        
        Args:
            response: The response object with a streaming JSONL body
            
        Yields:
            Each parsed JSON object from the response
        """
        for item in self._stream_jsonl_items(response):
            if 'isError' in item:
                # TODO: include cause
                raise Exception(item['reason'])
            yield item