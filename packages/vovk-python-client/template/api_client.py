# makeRequest(apiRoot, fullSchema, segmentName, controllerName, handlerName)
# makeRequestInner(URL, httpMethod, body, query, params, validation)
# Validate: body, query, params
# Send Accept header and accept JSON lines to handle streaming
"""
https://grok.com/chat/c2deb9d1-5494-4df8-99f1-0c5dbdd80551
Prompt: 
Write me a python function that makes a request to the API. The function accepts the following parameters:
- url: string
- httpMethod: string
- body: optional dict
- query: optional dict
- params: optional dict
- validation: a dict with the following keys: body, query, params. Each dict value is an optional JSON schema that should be used to validate the corresponding data. If validation is present but the corresponding data is not, the function should raise an exception. If the data is present but does not match the schema, the function should raise an exception. If validation is not present, the data should not be validated.

Body, if present should be validated and sent as JSON in the request body. 
Query, if present, should be validated and should be converted to query parameters in the URL. Nested should be converted in to the format:
?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue
for data 

{
  x: 'xx',
  y: ['yy', 'uu'],
  z: {
    f: 'x',
    u: ['uu', 'xx'],
    d: {
      x: 'ee',
      arrOfObjects: [
        {
          foo: 'bar',
          nestedArr: ['one', 'two', 'three'],
        },
        {
          foo: 'baz',
          nestedObj: {
            deepKey: 'deepValue',
          },
        },
      ],
    },
  },
}
Params, if present, should be validated and used to replace URL occurences started with :. For example, if the URL is example.com/api/:id and params is { id: '123' }, the URL should be converted to example.com/api/123.

The request should send a header accepts with: application/jsonl and application/json

If the response has content-type of application/json it should be treated as JSON and the function should return the parsed JSON.

If the response has content-type of application/jsonl it should be treated as JSON streaming and the function should return a generator that yields each line of the response.

The Typescript implementation for streaming async generator is provided below. It considers that the response is a stream of JSON lines that can be streamed from the server incomplete or include a chunk from the next line. The generator should handle this case and return the complete JSON objects.

import { HttpStatus, type VovkErrorResponse } from '../types';
import type { VovkStreamAsyncIterable } from './types';
import { HttpException } from '../HttpException';
import '../utils/shim';

export const DEFAULT_ERROR_MESSAGE = 'Unknown error at defaultStreamHandler';

export const defaultStreamHandler = async (response: Response): Promise<VovkStreamAsyncIterable<unknown>> => {
  if (!response.ok) {
    let result: unknown;
    try {
      result = await response.json();
    } catch {
      // ignore parsing errors
    }
    // handle server errors
    throw new HttpException(response.status, (result as VovkErrorResponse).message ?? DEFAULT_ERROR_MESSAGE);
  }

  if (!response.body) throw new HttpException(HttpStatus.NULL, 'Stream body is falsy. Check your controller code.');

  const reader = response.body.getReader();

  // if streaming is too rapid, we need to make sure that the loop is stopped
  let canceled = false;

  async function* asyncIterator() {
    let prepend = '';

    while (true) {
      let value: Uint8Array | undefined;
      let done = false;

      try {
        ({ value, done } = await reader.read());
      } catch (error) {
        await reader.cancel();
        const err = new Error('Stream error. ' + String(error));
        err.cause = error;
        throw err;
      }

      if (done) {
        return;
      }

      // typeof value === 'number' is a workaround for React Native
      const string = typeof value === 'number' ? String.fromCharCode(value) : new TextDecoder().decode(value);
      prepend += string;
      const lines = prepend.split('\n').filter(Boolean);
      for (const line of lines) {
        let data;
        try {
          data = JSON.parse(line) as object;
          prepend = '';
        } catch {
          break;
        }

        if (data) {
          if ('isError' in data && 'reason' in data) {
            const upcomingError = data.reason;
            await reader.cancel();

            if (typeof upcomingError === 'string') {
              throw new Error(upcomingError);
            }

            throw upcomingError;
          } else if (!canceled) {
            yield data;
          }
        }
      }
    }
  }

  return {
    status: response.status,
    [Symbol.asyncIterator]: asyncIterator,
    [Symbol.dispose]: () => reader.cancel(),
    [Symbol.asyncDispose]: () => reader.cancel(),
    cancel: () => {
      canceled = true;
      return reader.cancel();
    },
  };
};


"""


import json
import requests
import jsonschema
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
    def __init__(self, api_root: str, full_schema: Any):
        """
        Initialize the API client with a base URL and default HTTP method.
        
        Args:
            api_root: The base URL for all API requests
            default_http_method: Default HTTP method to use if not specified
        """
        self.api_root = api_root
        self.full_schema = full_schema
    
    def request(
        self,
        segment_name: str,
        controller_name: str,
        handler_name: str,
        api_root: Optional[str],
        body: Optional[Any] = None,
        query: Optional[Any] = None,
        params: Optional[Any] = None,
        disable_client_validation: bool = False
    ) -> Any:
        """
        Make an API request based on a full schema and controller/handler
        configuration.
        """
        # Extract relevant information from the full schema
        schema = self.full_schema['segments'][segment_name]
        controller = schema['controllers'][controller_name]
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
            validation=validation,
            disable_client_validation=disable_client_validation
        )
        
    def make_api_request(
        self,
        url: str,
        http_method: Literal['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        body: Optional[Dict[str, Any]] = None,
        query: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        validation: Optional[Dict[str, Any]] = None,
        disable_client_validation: bool = False
    ) -> Any:
        """
        Make an API request with optional validation and parameter handling.
        
        Args:
            url: The URL to make the request to
            http_method: HTTP method (GET, POST, PUT, DELETE, etc.)
            body: Optional dictionary to send as JSON in the request body
            query: Optional dictionary to convert to query parameters
            params: Optional dictionary to replace URL parameters
            validation: Optional dictionary with JSON schemas to validate body, query, and params
            
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
        # Validate inputs if validation schema is provided
        if validation and not disable_client_validation:
            # Validate body
            if validation['body']:
                if body is None:
                    raise ValueError("Body is required for validation but not provided")
                jsonschema.validate(instance=body, schema=validation['body'])
            
            # Validate query
            if validation['query']:
                if query is None:
                    raise ValueError("Query is required for validation but not provided")
                jsonschema.validate(instance=query, schema=validation['query'])
            
            # Validate params
            if validation['params']:
                if params is None:
                    raise ValueError("Params are required for validation but not provided")
                jsonschema.validate(instance=params, schema=validation['params'])
        
        # Process URL and substitute path parameters
        processed_url = url
        if params:
            for key, value in params.items():
                pattern = f":{key}"
                processed_url = processed_url.replace(pattern, str(value))
        
        # Process query parameters if present
        if query:
            query_string = self._build_query_string(query)
            if "?" in processed_url:
                processed_url += "&" + query_string
            else:
                processed_url += "?" + query_string
        
        # Prepare headers
        headers = {
            'Accept': 'application/jsonl, application/json'
        }
        
        if body:
            headers['Content-Type'] = 'application/json'
        
        # Make the request
        response = requests.request(
            method=http_method.upper(),
            url=processed_url,
            headers=headers,
            json=body if body else None,
            stream=True  # Always stream for consistent handling
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