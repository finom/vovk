
# auto-generated 2025-02-18T15:03:12.006Z
from typing import Any, Dict, List, Literal, Optional, Set, TypedDict, Union, Tuple
from email.message import EmailMessage
from datetime import date, datetime, time
from typing import Protocol

class Sized(TypedDict):
    x: int

class Iterable(TypedDict):
    d: dict

# Must implement both protocols
SizedIterable = TypedDict('SizedIterable', {})


# Optional but recommended if using Python 3.7+:
from __future__ import annotations  # Enables forward references in type hints

def _load_full_schema() -> dict:
    """
    Loads the 'full-schema.json' file (which must sit in the same folder as this __init__.py).
    Returns it as a Python dictionary.
    """
    current_dir = os.path.dirname(__file__)
    schema_path = os.path.join(current_dir, "full-schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)
full_schema = _load_full_schema()
default_api_root = 'http://localhost:3000/api';


class ClientControllerRPC: 
    # ClientControllerRPC.getHelloWorldResponseObject GET http://localhost:3000/api/foo/client/client/get-hello-world-response-object
    @staticmethod
    def getHelloWorldResponseObject(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-response-object"
        
    # ClientControllerRPC.getHelloWorldObjectLiteral GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal
    @staticmethod
    def getHelloWorldObjectLiteral(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-object-literal"
        
    # ClientControllerRPC.getHelloWorldNextResponseObjectPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-next-response-object-promise
    @staticmethod
    def getHelloWorldNextResponseObjectPromise(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-next-response-object-promise"
        
    # ClientControllerRPC.getHelloWorldRawResponseObjectPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-raw-response-object-promise
    @staticmethod
    def getHelloWorldRawResponseObjectPromise(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-raw-response-object-promise"
        
    # ClientControllerRPC.getHelloWorldObjectLiteralPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal-promise
    @staticmethod
    def getHelloWorldObjectLiteralPromise(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-object-literal-promise"
        
    # ClientControllerRPC.getHelloWorldHeaders GET http://localhost:3000/api/foo/client/client/get-hello-world-headers
    @staticmethod
    def getHelloWorldHeaders(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-headers"
        
    # ClientControllerRPC.getHelloWorldArray GET http://localhost:3000/api/foo/client/client/get-hello-world-array
    @staticmethod
    def getHelloWorldArray(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-array"
        
    # ClientControllerRPC.getHelloWorldAndEmptyGeneric GET http://localhost:3000/api/foo/client/client/get-hello-world-and-empty-generic
    @staticmethod
    def getHelloWorldAndEmptyGeneric(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/get-hello-world-and-empty-generic"
        
    # ClientControllerRPC.getWithParams GET http://localhost:3000/api/foo/client/client/with-params/:hello
    @staticmethod
    def getWithParams(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/with-params/:hello"
        
    # ClientControllerRPC.postWithAll POST http://localhost:3000/api/foo/client/client/with-all/:hello
    @staticmethod
    def postWithAll(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/with-all/:hello"
        
    # ClientControllerRPC.postWithBodyAndQueryUsingReqVovk POST http://localhost:3000/api/foo/client/client/with-all-using-req-vovk
    @staticmethod
    def postWithBodyAndQueryUsingReqVovk(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/with-all-using-req-vovk"
        
    # ClientControllerRPC.getNestedQuery GET http://localhost:3000/api/foo/client/client/nested-query
    @staticmethod
    def getNestedQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/nested-query"
        
    # ClientControllerRPC.postWithFormDataUsingReqVovk POST http://localhost:3000/api/foo/client/client/form-data
    @staticmethod
    def postWithFormDataUsingReqVovk(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/form-data"
        
    # ClientControllerRPC.getErrorResponse GET http://localhost:3000/api/foo/client/client/error
    @staticmethod
    def getErrorResponse(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/client/error"
        
    
class StreamingControllerRPC: 
    # StreamingControllerRPC.postWithStreaming POST http://localhost:3000/api/foo/client/streaming/post-with-streaming
    @staticmethod
    def postWithStreaming(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming/post-with-streaming"
        
    # StreamingControllerRPC.postWithStreamingAndImmediateError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-immediate-error
    @staticmethod
    def postWithStreamingAndImmediateError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming/post-with-streaming-and-immediate-error"
        
    # StreamingControllerRPC.postWithStreamingAndDelayedError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-error
    @staticmethod
    def postWithStreamingAndDelayedError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming/post-with-streaming-and-delayed-error"
        
    # StreamingControllerRPC.postWithStreamingAndDelayedCustomError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-custom-error
    @staticmethod
    def postWithStreamingAndDelayedCustomError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming/post-with-streaming-and-delayed-custom-error"
        
    # StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error
    @staticmethod
    def postWithStreamingAndDelayedUnhandledError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error"
        
    
class StreamingGeneratorControllerRPC: 
    # StreamingGeneratorControllerRPC.getWithStreaming GET http://localhost:3000/api/foo/client/streaming-generator/get-with-streaming
    @staticmethod
    def getWithStreaming(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/get-with-streaming"
        
    # StreamingGeneratorControllerRPC.postWithAsyncStreaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-async-streaming
    @staticmethod
    def postWithAsyncStreaming(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-async-streaming"
        
    # StreamingGeneratorControllerRPC.postWithStreaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming
    @staticmethod
    def postWithStreaming(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-streaming"
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-immediate-error
    @staticmethod
    def postWithStreamingAndImmediateError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-streaming-and-immediate-error"
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-error
    @staticmethod
    def postWithStreamingAndDelayedError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-streaming-and-delayed-error"
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error
    @staticmethod
    def postWithStreamingAndDelayedCustomError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error"
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error
    @staticmethod
    def postWithStreamingAndDelayedUnhandledError(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error"
        
    
class CustomSchemaControllerRPC: 
    class Body(TypedDict):
                hellox: Literal["worldx"]
    # CustomSchemaControllerRPC.getWithCustomSchema GET http://localhost:3000/api/foo/client//get-with-custom-schema
    @staticmethod
    def getWithCustomSchema(
        body: Body, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client//get-with-custom-schema"
        
    
class WithZodClientControllerRPC: 
    class X(TypedDict):
        y: EmailStr
    class Body(TypedDict):
        x: WithZodClientControllerRPC.X
    # WithZodClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-zod/all/:foo/:bar
    @staticmethod
    def handleAll(
        body: WithZodClientControllerRPC.Body, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        This is a summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/all/:foo/:bar"
        
    # WithZodClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-zod/handle-query
    @staticmethod
    def handleQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-query"
        
    # WithZodClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-zod/handle-body
    @staticmethod
    def handleBody(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-body"
        
    # WithZodClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-zod/x/:foo/:bar/y
    @staticmethod
    def handleParams(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/x/:foo/:bar/y"
        
    # WithZodClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-zod/handle-nested-query
    @staticmethod
    def handleNestedQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-nested-query"
        
    # WithZodClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-zod/handle-output
    @staticmethod
    def handleOutput(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-output"
        
    # WithZodClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-zod/handle-stream
    @staticmethod
    def handleStream(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-stream"
        
    # WithZodClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-zod/handle-nothitng
    @staticmethod
    def handleNothitng(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-zod/handle-nothitng"
        
    
class WithYupClientControllerRPC: 
    # WithYupClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-yup/all/:foo/:bar
    @staticmethod
    def handleAll(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        This is a summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/all/:foo/:bar"
        
    # WithYupClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-yup/handle-query
    @staticmethod
    def handleQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-query"
        
    # WithYupClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-yup/handle-body
    @staticmethod
    def handleBody(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-body"
        
    # WithYupClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-yup/x/:foo/:bar/y
    @staticmethod
    def handleParams(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/x/:foo/:bar/y"
        
    # WithYupClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-yup/handle-nested-query
    @staticmethod
    def handleNestedQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-nested-query"
        
    # WithYupClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-yup/handle-output
    @staticmethod
    def handleOutput(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-output"
        
    # WithYupClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-yup/handle-stream
    @staticmethod
    def handleStream(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-stream"
        
    # WithYupClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-yup/handle-nothitng
    @staticmethod
    def handleNothitng(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-yup/handle-nothitng"
        
    
class WithDtoClientControllerRPC: 
    # WithDtoClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar
    @staticmethod
    def handleAll(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        This is a summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/all/:foo/:bar"
        
    # WithDtoClientControllerRPC.handleAllClient POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar/client
    @staticmethod
    def handleAllClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/all/:foo/:bar/client"
        
    # WithDtoClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-dto/handle-query
    @staticmethod
    def handleQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-query"
        
    # WithDtoClientControllerRPC.handleQueryClient GET http://localhost:3000/api/foo/client/with-dto/handle-query-client
    @staticmethod
    def handleQueryClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-query-client"
        
    # WithDtoClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-dto/handle-body
    @staticmethod
    def handleBody(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-body"
        
    # WithDtoClientControllerRPC.handleBodyClient POST http://localhost:3000/api/foo/client/with-dto/handle-body-client
    @staticmethod
    def handleBodyClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-body-client"
        
    # WithDtoClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y
    @staticmethod
    def handleParams(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/x/:foo/:bar/y"
        
    # WithDtoClientControllerRPC.handleParamsClient PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y/client
    @staticmethod
    def handleParamsClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/x/:foo/:bar/y/client"
        
    # WithDtoClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query
    @staticmethod
    def handleNestedQuery(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-nested-query"
        
    # WithDtoClientControllerRPC.handleNestedQueryClient GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query-client
    @staticmethod
    def handleNestedQueryClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-nested-query-client"
        
    # WithDtoClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-dto/handle-output
    @staticmethod
    def handleOutput(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-output"
        
    # WithDtoClientControllerRPC.handleOutputClient GET http://localhost:3000/api/foo/client/with-dto/handle-output-client
    @staticmethod
    def handleOutputClient(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-output-client"
        
    # WithDtoClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-dto/handle-stream
    @staticmethod
    def handleStream(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-stream"
        
    # WithDtoClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-dto/handle-nothitng
    @staticmethod
    def handleNothitng(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/with-dto/handle-nothitng"
        
    
class OpenApiControllerRPC: 
    # OpenApiControllerRPC.getSchema GET http://localhost:3000/api/foo/client/openapi/
    @staticmethod
    def getSchema(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        Hello, World!
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/foo/client/openapi/"
        
    

class NoValidationControllerOnlyEntityRPC: 
    # NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities GET http://localhost:3000/api/generated/no-validation-controller-only-entities/
    @staticmethod
    def getNoValidationControllerOnlyEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-only-entities/"
        
    # NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity PUT http://localhost:3000/api/generated/no-validation-controller-only-entities/:id
    @staticmethod
    def updateNoValidationControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-only-entities/:id"
        
    # NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity POST http://localhost:3000/api/generated/no-validation-controller-only-entities/
    @staticmethod
    def createNoValidationControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-only-entities/"
        
    # NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity DELETE http://localhost:3000/api/generated/no-validation-controller-only-entities/:id
    @staticmethod
    def deleteNoValidationControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-only-entities/:id"
        
    
class NoValidationControllerAndServiceEntityRPC: 
    # NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities GET http://localhost:3000/api/generated/no-validation-controller-and-service-entities/
    @staticmethod
    def getNoValidationControllerAndServiceEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-and-service-entities/"
        
    # NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity PUT http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id
    @staticmethod
    def updateNoValidationControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-and-service-entities/:id"
        
    # NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity POST http://localhost:3000/api/generated/no-validation-controller-and-service-entities/
    @staticmethod
    def createNoValidationControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-and-service-entities/"
        
    # NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity DELETE http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id
    @staticmethod
    def deleteNoValidationControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/no-validation-controller-and-service-entities/:id"
        
    
class ZodControllerOnlyEntityRPC: 
    # ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities GET http://localhost:3000/api/generated/zod-controller-only-entities/
    @staticmethod
    def getZodControllerOnlyEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-only-entities/"
        
    # ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity PUT http://localhost:3000/api/generated/zod-controller-only-entities/:id
    @staticmethod
    def updateZodControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-only-entities/:id"
        
    # ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity POST http://localhost:3000/api/generated/zod-controller-only-entities/
    @staticmethod
    def createZodControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-only-entities/"
        
    # ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity DELETE http://localhost:3000/api/generated/zod-controller-only-entities/:id
    @staticmethod
    def deleteZodControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-only-entities/:id"
        
    
class ZodControllerAndServiceEntityRPC: 
    # ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities GET http://localhost:3000/api/generated/zod-controller-and-service-entities/
    @staticmethod
    def getZodControllerAndServiceEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-and-service-entities/"
        
    # ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity PUT http://localhost:3000/api/generated/zod-controller-and-service-entities/:id
    @staticmethod
    def updateZodControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-and-service-entities/:id"
        
    # ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity POST http://localhost:3000/api/generated/zod-controller-and-service-entities/
    @staticmethod
    def createZodControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-and-service-entities/"
        
    # ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity DELETE http://localhost:3000/api/generated/zod-controller-and-service-entities/:id
    @staticmethod
    def deleteZodControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/zod-controller-and-service-entities/:id"
        
    
class YupControllerOnlyEntityRPC: 
    # YupControllerOnlyEntityRPC.getYupControllerOnlyEntities GET http://localhost:3000/api/generated/yup-controller-only-entities/
    @staticmethod
    def getYupControllerOnlyEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-only-entities/"
        
    # YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity PUT http://localhost:3000/api/generated/yup-controller-only-entities/:id
    @staticmethod
    def updateYupControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-only-entities/:id"
        
    # YupControllerOnlyEntityRPC.createYupControllerOnlyEntity POST http://localhost:3000/api/generated/yup-controller-only-entities/
    @staticmethod
    def createYupControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-only-entities/"
        
    # YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity DELETE http://localhost:3000/api/generated/yup-controller-only-entities/:id
    @staticmethod
    def deleteYupControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-only-entities/:id"
        
    
class YupControllerAndServiceEntityRPC: 
    # YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities GET http://localhost:3000/api/generated/yup-controller-and-service-entities/
    @staticmethod
    def getYupControllerAndServiceEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-and-service-entities/"
        
    # YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity PUT http://localhost:3000/api/generated/yup-controller-and-service-entities/:id
    @staticmethod
    def updateYupControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-and-service-entities/:id"
        
    # YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity POST http://localhost:3000/api/generated/yup-controller-and-service-entities/
    @staticmethod
    def createYupControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-and-service-entities/"
        
    # YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity DELETE http://localhost:3000/api/generated/yup-controller-and-service-entities/:id
    @staticmethod
    def deleteYupControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/yup-controller-and-service-entities/:id"
        
    
class DtoControllerOnlyEntityRPC: 
    # DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities GET http://localhost:3000/api/generated/dto-controller-only-entities/
    @staticmethod
    def getDtoControllerOnlyEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-only-entities/"
        
    # DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity PUT http://localhost:3000/api/generated/dto-controller-only-entities/:id
    @staticmethod
    def updateDtoControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-only-entities/:id"
        
    # DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity POST http://localhost:3000/api/generated/dto-controller-only-entities/
    @staticmethod
    def createDtoControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-only-entities/"
        
    # DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity DELETE http://localhost:3000/api/generated/dto-controller-only-entities/:id
    @staticmethod
    def deleteDtoControllerOnlyEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-only-entities/:id"
        
    
class DtoControllerAndServiceEntityRPC: 
    # DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities GET http://localhost:3000/api/generated/dto-controller-and-service-entities/
    @staticmethod
    def getDtoControllerAndServiceEntities(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-and-service-entities/"
        
    # DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity PUT http://localhost:3000/api/generated/dto-controller-and-service-entities/:id
    @staticmethod
    def updateDtoControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-and-service-entities/:id"
        
    # DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity POST http://localhost:3000/api/generated/dto-controller-and-service-entities/
    @staticmethod
    def createDtoControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-and-service-entities/"
        
    # DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity DELETE http://localhost:3000/api/generated/dto-controller-and-service-entities/:id
    @staticmethod
    def deleteDtoControllerAndServiceEntity(
        body: Any, 
        query: Any, 
        params: Any,
        api_root: str | None = None
    ) -> Any:
        """
        No summary
        
        
        
        
        """
        if api_root is None:
            api_root = default_api_root
        url = f"{api_root}/generated/dto-controller-and-service-entities/:id"
        
    

WithZodClientControllerRPC.handleAll(
    body={"x": {"y": "world"}}, 
    query=None, 
    params=None
)
