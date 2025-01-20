import os
import json
import requests
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from typing import Optional

__all__ = []  # We'll populate this dynamically

class ServerError(Exception):
    """Custom exception for server errors that include statusCode and/or message."""
    def __init__(self, status_code: int, message: str):
        super().__init__(f"[{status_code}] {message}")
        self.status_code = status_code
        self.server_message = message

def _load_full_schema() -> dict:
    """
    Loads the 'full-schema.json' file (which must sit in the same folder as this __init__.py).
    Returns it as a Python dictionary.
    """
    current_dir = os.path.dirname(__file__)
    schema_path = os.path.join(current_dir, "full-schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)

class _RPCBase:
    """
    Base class that provides a validated HTTP request mechanism.
    All dynamic RPC classes will subclass this.
    """
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def _handle_stream_response(self, resp: requests.Response):
        """
        Returns a generator that yields JSON objects from a newline-delimited stream.
        It attempts to parse each line as valid JSON.
        If we encounter an 'isError' structure, we raise a ServerError immediately.
        """
        buffer = ""

        # We'll use resp.iter_content(...) to handle partial chunks
        # decode_unicode=True gives us str chunks in Python 3.
        for chunk in resp.iter_content(chunk_size=None, decode_unicode=True):
            buffer += chunk
            lines = buffer.split("\n")
            # We'll parse every line except the last, which might still be partial
            for line in lines[:-1]:
                line = line.strip()
                if not line:
                    continue  # skip empty lines

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    # Could happen if line is incomplete, but we got a newline anyway
                    continue

                # If the server signals an error in-stream
                if data.get("isError") and "reason" in data:
                    resp.close()
                    raise ServerError(resp.status_code, str(data["reason"]))

                yield data

            # The last piece (lines[-1]) may be incomplete
            buffer = lines[-1]

        # If there's leftover data in the buffer (no trailing newline at end):
        leftover = buffer.strip()
        if leftover:
            try:
                data = json.loads(leftover)
                if data.get("isError") and "reason" in data:
                    resp.close()
                    raise ServerError(resp.status_code, str(data["reason"]))
                yield data
            except json.JSONDecodeError:
                # Not valid JSON or partial leftover
                pass

        # End of stream; close the connection
        resp.close()

    def _request(
        self,
        method: str,
        endpoint_path: str,
        query: Optional[dict] = None,
        body: Optional[dict] = None,
        query_schema: Optional[dict] = None,
        body_schema: Optional[dict] = None,
        disable_client_validation: bool = False
    ):
        """
        1. If disable_client_validation is False, validates `query` & `body` (if schemas).
        2. Makes an HTTP request (using `requests` with stream=True).
        3. If the response is not 2xx:
           - parse JSON for a possible error structure
           - or raise requests.HTTPError if not available
        4. If 'x-vovk-stream' == 'true', return a generator that yields JSON objects.
        5. Otherwise, parse and return the actual response (JSON -> dict or fallback to text).
        """
        # Validate query and body if schemas are provided AND validation not disabled
        if not disable_client_validation:
            if query_schema:
                validate(instance=query or {}, schema=query_schema)
            if body_schema:
                validate(instance=body or {}, schema=body_schema)

        # Build the final URL
        url = f"{self.base_url}/{endpoint_path}"

        # Make the request (stream=True to handle streaming)
        resp = requests.request(
            method=method,
            url=url,
            params=query,
            json=body,
            stream=True
        )

        # Check if status is not 2xx
        if not resp.ok:
            try:
                # Attempt to parse JSON error
                data = resp.json()
                # Example: { "statusCode": 400, "message": "Zod validation failed...", "isError": true }
                if data.get("isError"):
                    status_code = data.get("statusCode", resp.status_code)
                    message = data.get("message", resp.text)
                    resp.close()
                    raise ServerError(status_code, message)
                else:
                    # Not the structured error we expect - fallback
                    resp.raise_for_status()
            except ValueError:
                # If parsing fails, fallback
                resp.raise_for_status()

        # If we get here, resp is 2xx. Check if streaming is requested.
        if resp.headers.get("x-vovk-stream", "").lower() == "true":
            return self._handle_stream_response(resp)

        # Non-streaming: parse JSON or return text
        content_type = resp.headers.get("Content-Type", "").lower()
        try:
            if "application/json" in content_type:
                result = resp.json()  # parse the body as JSON
            else:
                result = resp.text  # fallback if not JSON
        finally:
            # In either case, we can close the connection now since we're reading full body
            resp.close()

        return result


def _build_controller_class(
    controller_name: str,
    controller_spec: dict,
    segment_name: str
):
    """
    Builds a dynamic class (subclass of _RPCBase) for a single controller.
    Instead of instance methods, we create class methods so we can call
    them directly on the class (passing base_url, query, body, etc.).

    The endpoints will be constructed as: `segmentName/prefix/path`.
    If `prefix` or `path` contain placeholder segments like `:id`, 
    they can be replaced by passing a `params` dict, e.g. { "id": 123 }
    which would convert "/foo/:id/bar" --> "/foo/123/bar"
    """
    prefix = controller_spec.get("prefix", "").strip("/")
    handlers = controller_spec.get("handlers", {})

    class_attrs = {}

    for handler_name, handler_data in handlers.items():
        # HTTP method (e.g., "GET", "POST", etc.)
        http_method = handler_data["httpMethod"]

        # Path defined in the schema (may contain ":id", etc.)
        path = handler_data["path"].strip("/")

        # Combine "segmentName/prefix/path" into a single path
        endpoint_path = f"{segment_name}/{prefix}/{path}".strip("/")

        # Optional JSON schemas (for query/body)
        validation = handler_data.get("validation", {})
        query_schema = validation.get("query")
        body_schema = validation.get("body")

        def make_class_method(
            m=http_method,
            ep=endpoint_path,
            q_schema=query_schema,
            b_schema=body_schema,
            name=handler_name
        ):
            @classmethod
            def handler(cls, base_url, *, query=None, body=None, params=None, disable_client_validation=False):
                """
                Class method that instantiates the RPC class (with base_url)
                and immediately calls _request on that instance.

                :param base_url:   The base URL of your API.
                :param query:      An optional dict for query parameters.
                :param body:       An optional dict for the request JSON body.
                :param params:     A dict for path substitutions, e.g. {"id": 42}
                                   which will replace ":id" in the endpoint path.
                :param disable_client_validation: If True, skip schema validation.
                """
                final_endpoint_path = ep

                # Perform path param substitution if needed
                for param_key, param_val in (params or {}).items():
                    final_endpoint_path = final_endpoint_path.replace(
                        f":{param_key}",
                        str(param_val)
                    )

                # Instantiate and make the request
                temp_instance = cls(base_url)
                return temp_instance._request(
                    method=m,
                    endpoint_path=final_endpoint_path,
                    query=query,
                    body=body,
                    query_schema=q_schema,
                    body_schema=b_schema,
                    disable_client_validation=disable_client_validation
                )

            handler.__name__ = name
            return handler

        # Attach the generated class method for this handler
        class_attrs[handler_name] = make_class_method()

    # Dynamically create a new subclass of _RPCBase with those methods
    return type(controller_name, (_RPCBase,), class_attrs)

def _load_controllers():
    """
    Reads the entire 'full-schema.json',
    iterates over each top-level segment (like 'xxx', 'yyy'),
    extracts the segmentName + controllers,
    and dynamically builds classes for each controller.
    """
    data = _load_full_schema()
    all_controllers = {}

    for segment_key, segment_obj in data.items():
        segment_name = segment_obj.get("segmentName", "").strip("/")
        controllers = segment_obj.get("controllers", {})

        for ctrl_name, ctrl_spec in controllers.items():
            dynamic_class = _build_controller_class(
                controller_name=ctrl_name,
                controller_spec=ctrl_spec,
                segment_name=segment_name
            )
            all_controllers[ctrl_name] = dynamic_class

    return all_controllers

# Build all controllers at import time
_controllers_dict = _load_controllers()

# Export them at the top level
for ctrl_name, ctrl_class in _controllers_dict.items():
    globals()[ctrl_name] = ctrl_class
    __all__.append(ctrl_name)

