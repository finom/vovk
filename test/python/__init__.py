# __init__.py
import os
import json
import requests
from jsonschema import validate, ValidationError
from typing import Optional, Dict, Any

__all__ = []  # We'll populate this dynamically

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

    def _request(
        self,
        method: str,
        endpoint_path: str,
        query: Optional[dict] = None,
        body: Optional[dict] = None,
        query_schema: Optional[dict] = None,
        body_schema: Optional[dict] = None,
    ) -> requests.Response:
        """
        1. Validates `query` & `body` against JSON Schemas (if provided).
        2. Makes an HTTP request (using `requests`).
        3. Raises for non-2xx responses.
        """
        if query_schema:
            validate(instance=query or {}, schema=query_schema)
        if body_schema:
            validate(instance=body or {}, schema=body_schema)

        url = f"{self.base_url}/{endpoint_path}"
        resp = requests.request(
            method=method,
            url=url,
            params=query,
            json=body
        )
        resp.raise_for_status()
        return resp

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
    """
    prefix = controller_spec.get("prefix", "").strip("/")
    handlers = controller_spec.get("handlers", {})

    class_attrs = {}

    for handler_name, handler_data in handlers.items():
        http_method = handler_data["httpMethod"]
        path = handler_data["path"].strip("/")

        # Compose the final endpoint path => "segmentName/prefix/path"
        endpoint_path = f"{segment_name}/{prefix}/{path}".strip("/")

        # Optional JSON schemas
        validation = handler_data.get("validation", {})
        query_schema = validation.get("query")
        body_schema = validation.get("body")

        # Build a CLASS METHOD instead of an instance method
        def make_class_method(
            m=http_method,
            ep=endpoint_path,
            q_schema=query_schema,
            b_schema=body_schema,
            name=handler_name
        ):
            @classmethod
            def handler(cls, base_url, *, query=None, body=None):
                """
                Class method that instantiates the RPC class (with base_url)
                and immediately calls _request on that instance.
                """
                temp_instance = cls(base_url)
                return temp_instance._request(
                    method=m,
                    endpoint_path=ep,
                    query=query,
                    body=body,
                    query_schema=q_schema,
                    body_schema=b_schema
                )
            handler.__name__ = name
            return handler

        # Attach it as a class method
        class_attrs[handler_name] = make_class_method()

    # Create a new class type dynamically
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

    # Example top-level structure:
    # {
    #   "xxx": { "segmentName": "foo", "controllers": { "JobRPC": { ... } } },
    #   "yyy": { "segmentName": "bar", "controllers": { "TaskRPC": { ... } } }
    # }
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

# Build *all* controllers at import time
_controllers_dict = _load_controllers()

# Expose them at the top level
for ctrl_name, ctrl_class in _controllers_dict.items():
    globals()[ctrl_name] = ctrl_class
    __all__.append(ctrl_name)
