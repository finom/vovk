
# auto-generated 2025-02-28T18:18:29.156Z
from typing import Any, Dict, List, Literal, Optional, Set, TypedDict, Union, Tuple
import os
import json
from api_client import ApiClient

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
api_client = new ApiClient('http://localhost:3000/api')


class ClientControllerRPC: 
    # ClientControllerRPC.getHelloWorldResponseObject GET http://localhost:3000/api/foo/client/client/get-hello-world-response-object

    @staticmethod
    def getHelloWorldResponseObject(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldResponseObject',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldObjectLiteral GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal

    @staticmethod
    def getHelloWorldObjectLiteral(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldObjectLiteral',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldNextResponseObjectPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-next-response-object-promise

    @staticmethod
    def getHelloWorldNextResponseObjectPromise(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldNextResponseObjectPromise',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldRawResponseObjectPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-raw-response-object-promise

    @staticmethod
    def getHelloWorldRawResponseObjectPromise(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldRawResponseObjectPromise',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldObjectLiteralPromise GET http://localhost:3000/api/foo/client/client/get-hello-world-object-literal-promise

    @staticmethod
    def getHelloWorldObjectLiteralPromise(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldObjectLiteralPromise',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldHeaders GET http://localhost:3000/api/foo/client/client/get-hello-world-headers

    @staticmethod
    def getHelloWorldHeaders(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldHeaders',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldArray GET http://localhost:3000/api/foo/client/client/get-hello-world-array

    @staticmethod
    def getHelloWorldArray(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldArray',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getHelloWorldAndEmptyGeneric GET http://localhost:3000/api/foo/client/client/get-hello-world-and-empty-generic

    @staticmethod
    def getHelloWorldAndEmptyGeneric(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getHelloWorldAndEmptyGeneric',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getWithParams GET http://localhost:3000/api/foo/client/client/with-params/:hello

    @staticmethod
    def getWithParams(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getWithParams',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.postWithAll POST http://localhost:3000/api/foo/client/client/with-all/:hello

    @staticmethod
    def postWithAll(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='postWithAll',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.postWithBodyAndQueryUsingReqVovk POST http://localhost:3000/api/foo/client/client/with-all-using-req-vovk

    @staticmethod
    def postWithBodyAndQueryUsingReqVovk(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='postWithBodyAndQueryUsingReqVovk',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getNestedQuery GET http://localhost:3000/api/foo/client/client/nested-query

    @staticmethod
    def getNestedQuery(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getNestedQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.postWithFormDataUsingReqVovk POST http://localhost:3000/api/foo/client/client/form-data

    @staticmethod
    def postWithFormDataUsingReqVovk(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='postWithFormDataUsingReqVovk',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ClientControllerRPC.getErrorResponse GET http://localhost:3000/api/foo/client/client/error

    @staticmethod
    def getErrorResponse(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='ClientControllerRPC',
            handler_name='getErrorResponse',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class StreamingControllerRPC: 
    # StreamingControllerRPC.postWithStreaming POST http://localhost:3000/api/foo/client/streaming/post-with-streaming

    @staticmethod
    def postWithStreaming(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingControllerRPC',
            handler_name='postWithStreaming',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingControllerRPC.postWithStreamingAndImmediateError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-immediate-error

    @staticmethod
    def postWithStreamingAndImmediateError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingControllerRPC',
            handler_name='postWithStreamingAndImmediateError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingControllerRPC.postWithStreamingAndDelayedError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-error

    @staticmethod
    def postWithStreamingAndDelayedError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingControllerRPC',
            handler_name='postWithStreamingAndDelayedError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingControllerRPC.postWithStreamingAndDelayedCustomError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-custom-error

    @staticmethod
    def postWithStreamingAndDelayedCustomError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingControllerRPC',
            handler_name='postWithStreamingAndDelayedCustomError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingControllerRPC.postWithStreamingAndDelayedUnhandledError POST http://localhost:3000/api/foo/client/streaming/post-with-streaming-and-delayed-unhandled-error

    @staticmethod
    def postWithStreamingAndDelayedUnhandledError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingControllerRPC',
            handler_name='postWithStreamingAndDelayedUnhandledError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class StreamingGeneratorControllerRPC: 
    # StreamingGeneratorControllerRPC.getWithStreaming GET http://localhost:3000/api/foo/client/streaming-generator/get-with-streaming

    @staticmethod
    def getWithStreaming(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='getWithStreaming',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithAsyncStreaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-async-streaming

    @staticmethod
    def postWithAsyncStreaming(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithAsyncStreaming',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithStreaming POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming

    @staticmethod
    def postWithStreaming(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithStreaming',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndImmediateError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-immediate-error

    @staticmethod
    def postWithStreamingAndImmediateError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithStreamingAndImmediateError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-error

    @staticmethod
    def postWithStreamingAndDelayedError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithStreamingAndDelayedError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedCustomError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-custom-error

    @staticmethod
    def postWithStreamingAndDelayedCustomError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithStreamingAndDelayedCustomError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # StreamingGeneratorControllerRPC.postWithStreamingAndDelayedUnhandledError POST http://localhost:3000/api/foo/client/streaming-generator/post-with-streaming-and-delayed-unhandled-error

    @staticmethod
    def postWithStreamingAndDelayedUnhandledError(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='StreamingGeneratorControllerRPC',
            handler_name='postWithStreamingAndDelayedUnhandledError',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class CustomSchemaControllerRPC: 
    # CustomSchemaControllerRPC.getWithCustomSchema GET http://localhost:3000/api/foo/client//get-with-custom-schema

    @staticmethod
    def getWithCustomSchema(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='CustomSchemaControllerRPC',
            handler_name='getWithCustomSchema',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class WithZodClientControllerRPC: 
    # WithZodClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-zod/all/:foo/:bar
    class handleAll_Body(TypedDict):
        hello: str
    class handleAll_Query(TypedDict):
        search: str
    class handleAll_Params(TypedDict):
        foo: str
        bar: str
    class handleAll_Output_body(TypedDict):
        hello: str
    class handleAll_Output_query(TypedDict):
        search: str
    class handleAll_Output_params(TypedDict):
        foo: str
        bar: str
    class handleAll_Output_vovkParams(TypedDict):
        foo: str
        bar: str
    class handleAll_Output(TypedDict):
        body: WithZodClientControllerRPC.handleAll_Output_body
        query: WithZodClientControllerRPC.handleAll_Output_query
        params: WithZodClientControllerRPC.handleAll_Output_params
        vovkParams: WithZodClientControllerRPC.handleAll_Output_vovkParams
    @staticmethod
    def handleAll(
        body: WithZodClientControllerRPC.handleAll_Body, 
        query: WithZodClientControllerRPC.handleAll_Query,
        params: WithZodClientControllerRPC.handleAll_Params,
        api_root: str | None = None
    ) -> WithZodClientControllerRPC.handleAll_Output:
        """ 
        This is a summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleAll',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-zod/handle-query
    class handleQuery_Query(TypedDict):
        search: str
    @staticmethod
    def handleQuery(
        body: None, 
        query: WithZodClientControllerRPC.handleQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-zod/handle-body
    class handleBody_Body(TypedDict):
        hello: str
    @staticmethod
    def handleBody(
        body: WithZodClientControllerRPC.handleBody_Body, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleBody',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-zod/x/:foo/:bar/y
    class handleParams_Params(TypedDict):
        foo: str
        bar: str
    @staticmethod
    def handleParams(
        body: None, 
        query: None,
        params: WithZodClientControllerRPC.handleParams_Params,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleParams',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-zod/handle-nested-query
    class handleNestedQuery_Query_z_d_arrOfObjects_items_nestedObj(TypedDict):
        deepKey: str
    class handleNestedQuery_Query_z_d_arrOfObjects_items(TypedDict):
        foo: str
        nestedArr: Optional[List[str]]
        nestedObj: Optional[WithZodClientControllerRPC.handleNestedQuery_Query_z_d_arrOfObjects_items_nestedObj]
    class handleNestedQuery_Query_z_d(TypedDict):
        x: str
        arrOfObjects: List[WithZodClientControllerRPC.handleNestedQuery_Query_z_d_arrOfObjects_items]
    class handleNestedQuery_Query_z(TypedDict):
        f: str
        u: List[str]
        d: WithZodClientControllerRPC.handleNestedQuery_Query_z_d
    class handleNestedQuery_Query(TypedDict):
        x: str
        y: List[str]
        z: WithZodClientControllerRPC.handleNestedQuery_Query_z
    @staticmethod
    def handleNestedQuery(
        body: None, 
        query: WithZodClientControllerRPC.handleNestedQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleNestedQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-zod/handle-output
    class handleOutput_Query(TypedDict):
        helloOutput: str
    class handleOutput_Output(TypedDict):
        hello: str
    @staticmethod
    def handleOutput(
        body: None, 
        query: WithZodClientControllerRPC.handleOutput_Query,
        params: None,
        api_root: str | None = None
    ) -> WithZodClientControllerRPC.handleOutput_Output:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleOutput',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-zod/handle-stream
    class handleStream_Query(TypedDict):
        values: List[str]
    @staticmethod
    def handleStream(
        body: None, 
        query: WithZodClientControllerRPC.handleStream_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleStream',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithZodClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-zod/handle-nothitng

    @staticmethod
    def handleNothitng(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithZodClientControllerRPC',
            handler_name='handleNothitng',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class WithYupClientControllerRPC: 
    # WithYupClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-yup/all/:foo/:bar
    class handleAll_Body(TypedDict):
        hello: Literal["world"]
    class handleAll_Query(TypedDict):
        search: Literal["value"]
    class handleAll_Params(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    class handleAll_Output_body(TypedDict):
        hello: Literal["world"]
    class handleAll_Output_query(TypedDict):
        search: Literal["value"]
    class handleAll_Output_params(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    class handleAll_Output_vovkParams(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    class handleAll_Output(TypedDict):
        body: Optional[WithYupClientControllerRPC.handleAll_Output_body]
        query: Optional[WithYupClientControllerRPC.handleAll_Output_query]
        params: Optional[WithYupClientControllerRPC.handleAll_Output_params]
        vovkParams: Optional[WithYupClientControllerRPC.handleAll_Output_vovkParams]
    @staticmethod
    def handleAll(
        body: WithYupClientControllerRPC.handleAll_Body, 
        query: WithYupClientControllerRPC.handleAll_Query,
        params: WithYupClientControllerRPC.handleAll_Params,
        api_root: str | None = None
    ) -> WithYupClientControllerRPC.handleAll_Output:
        """ 
        This is a summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleAll',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-yup/handle-query
    class handleQuery_Query(TypedDict):
        search: Literal["value"]
    @staticmethod
    def handleQuery(
        body: None, 
        query: WithYupClientControllerRPC.handleQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-yup/handle-body
    class handleBody_Body(TypedDict):
        hello: Literal["world"]
    @staticmethod
    def handleBody(
        body: WithYupClientControllerRPC.handleBody_Body, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleBody',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-yup/x/:foo/:bar/y
    class handleParams_Params(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    @staticmethod
    def handleParams(
        body: None, 
        query: None,
        params: WithYupClientControllerRPC.handleParams_Params,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleParams',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-yup/handle-nested-query
    class handleNestedQuery_Query_z_d_arrOfObjects_items_nestedObj(TypedDict):
        deepKey: Optional[str]
    class handleNestedQuery_Query_z_d_arrOfObjects_items(TypedDict):
        foo: str
        nestedArr: Optional[List[str]]
        nestedObj: Optional[WithYupClientControllerRPC.handleNestedQuery_Query_z_d_arrOfObjects_items_nestedObj]
    class handleNestedQuery_Query_z_d(TypedDict):
        x: str
        arrOfObjects: List[WithYupClientControllerRPC.handleNestedQuery_Query_z_d_arrOfObjects_items]
    class handleNestedQuery_Query_z(TypedDict):
        f: str
        u: List[str]
        d: WithYupClientControllerRPC.handleNestedQuery_Query_z_d
    class handleNestedQuery_Query(TypedDict):
        x: str
        y: List[str]
        z: WithYupClientControllerRPC.handleNestedQuery_Query_z
    @staticmethod
    def handleNestedQuery(
        body: None, 
        query: WithYupClientControllerRPC.handleNestedQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleNestedQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-yup/handle-output
    class handleOutput_Query(TypedDict):
        helloOutput: str
    class handleOutput_Output(TypedDict):
        hello: Literal["world"]
    @staticmethod
    def handleOutput(
        body: None, 
        query: WithYupClientControllerRPC.handleOutput_Query,
        params: None,
        api_root: str | None = None
    ) -> WithYupClientControllerRPC.handleOutput_Output:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleOutput',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-yup/handle-stream
    class handleStream_Query(TypedDict):
        values: List[str]
    @staticmethod
    def handleStream(
        body: None, 
        query: WithYupClientControllerRPC.handleStream_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleStream',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithYupClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-yup/handle-nothitng

    @staticmethod
    def handleNothitng(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithYupClientControllerRPC',
            handler_name='handleNothitng',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class WithDtoClientControllerRPC: 
    # WithDtoClientControllerRPC.handleAll POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar
    class handleAll_Body(TypedDict):
        hello: Literal["world"]
    class handleAll_Query(TypedDict):
        search: Literal["value"]
    class handleAll_Params(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    class handleAll_Output(TypedDict):
        body: Any
        query: Any
        params: Any
        vovkParams: Any
    @staticmethod
    def handleAll(
        body: WithDtoClientControllerRPC.handleAll_Body, 
        query: WithDtoClientControllerRPC.handleAll_Query,
        params: WithDtoClientControllerRPC.handleAll_Params,
        api_root: str | None = None
    ) -> WithDtoClientControllerRPC.handleAll_Output:
        """ 
        This is a summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleAll',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleAllClient POST http://localhost:3000/api/foo/client/with-dto/all/:foo/:bar/client

    @staticmethod
    def handleAllClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleAllClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleQuery GET http://localhost:3000/api/foo/client/with-dto/handle-query
    class handleQuery_Query(TypedDict):
        search: Literal["value"]
    @staticmethod
    def handleQuery(
        body: None, 
        query: WithDtoClientControllerRPC.handleQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleQueryClient GET http://localhost:3000/api/foo/client/with-dto/handle-query-client

    @staticmethod
    def handleQueryClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleQueryClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleBody POST http://localhost:3000/api/foo/client/with-dto/handle-body
    class handleBody_Body(TypedDict):
        hello: Literal["world"]
    @staticmethod
    def handleBody(
        body: WithDtoClientControllerRPC.handleBody_Body, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleBody',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleBodyClient POST http://localhost:3000/api/foo/client/with-dto/handle-body-client

    @staticmethod
    def handleBodyClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleBodyClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleParams PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y
    class handleParams_Params(TypedDict):
        foo: Literal["foo"]
        bar: Literal["bar"]
    @staticmethod
    def handleParams(
        body: None, 
        query: None,
        params: WithDtoClientControllerRPC.handleParams_Params,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleParams',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleParamsClient PUT http://localhost:3000/api/foo/client/with-dto/x/:foo/:bar/y/client

    @staticmethod
    def handleParamsClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleParamsClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleNestedQuery GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query
    class handleNestedQuery_Query(TypedDict):
        x: str
        y: List[str]
        z: Any
    @staticmethod
    def handleNestedQuery(
        body: None, 
        query: WithDtoClientControllerRPC.handleNestedQuery_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleNestedQuery',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleNestedQueryClient GET http://localhost:3000/api/foo/client/with-dto/handle-nested-query-client

    @staticmethod
    def handleNestedQueryClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleNestedQueryClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleOutput GET http://localhost:3000/api/foo/client/with-dto/handle-output
    class handleOutput_Query(TypedDict):
        helloOutput: str
    class handleOutput_Output(TypedDict):
        hello: Literal["world"]
    @staticmethod
    def handleOutput(
        body: None, 
        query: WithDtoClientControllerRPC.handleOutput_Query,
        params: None,
        api_root: str | None = None
    ) -> WithDtoClientControllerRPC.handleOutput_Output:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleOutput',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleOutputClient GET http://localhost:3000/api/foo/client/with-dto/handle-output-client

    @staticmethod
    def handleOutputClient(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleOutputClient',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleStream GET http://localhost:3000/api/foo/client/with-dto/handle-stream
    class handleStream_Query(TypedDict):
        values: List[str]
    @staticmethod
    def handleStream(
        body: None, 
        query: WithDtoClientControllerRPC.handleStream_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleStream',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # WithDtoClientControllerRPC.handleNothitng POST http://localhost:3000/api/foo/client/with-dto/handle-nothitng

    @staticmethod
    def handleNothitng(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='WithDtoClientControllerRPC',
            handler_name='handleNothitng',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class OpenApiControllerRPC: 
    # OpenApiControllerRPC.getSchema GET http://localhost:3000/api/foo/client/openapi/

    @staticmethod
    def getSchema(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        Hello, World!
        """
        return api_client.request(
            segment_name='foo/client',
            controller_name='OpenApiControllerRPC',
            handler_name='getSchema',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    

class NoValidationControllerOnlyEntityRPC: 
    # NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities GET http://localhost:3000/api/generated/no-validation-controller-only-entities/

    @staticmethod
    def getNoValidationControllerOnlyEntities(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerOnlyEntityRPC',
            handler_name='getNoValidationControllerOnlyEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity PUT http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    @staticmethod
    def updateNoValidationControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerOnlyEntityRPC',
            handler_name='updateNoValidationControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity POST http://localhost:3000/api/generated/no-validation-controller-only-entities/

    @staticmethod
    def createNoValidationControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerOnlyEntityRPC',
            handler_name='createNoValidationControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity DELETE http://localhost:3000/api/generated/no-validation-controller-only-entities/:id

    @staticmethod
    def deleteNoValidationControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerOnlyEntityRPC',
            handler_name='deleteNoValidationControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class NoValidationControllerAndServiceEntityRPC: 
    # NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities GET http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    @staticmethod
    def getNoValidationControllerAndServiceEntities(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerAndServiceEntityRPC',
            handler_name='getNoValidationControllerAndServiceEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity PUT http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    @staticmethod
    def updateNoValidationControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerAndServiceEntityRPC',
            handler_name='updateNoValidationControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity POST http://localhost:3000/api/generated/no-validation-controller-and-service-entities/

    @staticmethod
    def createNoValidationControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerAndServiceEntityRPC',
            handler_name='createNoValidationControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity DELETE http://localhost:3000/api/generated/no-validation-controller-and-service-entities/:id

    @staticmethod
    def deleteNoValidationControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='NoValidationControllerAndServiceEntityRPC',
            handler_name='deleteNoValidationControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class ZodControllerOnlyEntityRPC: 
    # ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities GET http://localhost:3000/api/generated/zod-controller-only-entities/
    class getZodControllerOnlyEntities_Query(TypedDict):
        search: str
    @staticmethod
    def getZodControllerOnlyEntities(
        body: None, 
        query: ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerOnlyEntityRPC',
            handler_name='getZodControllerOnlyEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity PUT http://localhost:3000/api/generated/zod-controller-only-entities/:id
    class updateZodControllerOnlyEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateZodControllerOnlyEntity_Query(TypedDict):
        q: str
    class updateZodControllerOnlyEntity_Params(TypedDict):
        id: str
    @staticmethod
    def updateZodControllerOnlyEntity(
        body: ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity_Body, 
        query: ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity_Query,
        params: ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity_Params,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerOnlyEntityRPC',
            handler_name='updateZodControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity POST http://localhost:3000/api/generated/zod-controller-only-entities/

    @staticmethod
    def createZodControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerOnlyEntityRPC',
            handler_name='createZodControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity DELETE http://localhost:3000/api/generated/zod-controller-only-entities/:id

    @staticmethod
    def deleteZodControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerOnlyEntityRPC',
            handler_name='deleteZodControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class ZodControllerAndServiceEntityRPC: 
    # ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities GET http://localhost:3000/api/generated/zod-controller-and-service-entities/
    class getZodControllerAndServiceEntities_Query(TypedDict):
        search: str
    @staticmethod
    def getZodControllerAndServiceEntities(
        body: None, 
        query: ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerAndServiceEntityRPC',
            handler_name='getZodControllerAndServiceEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity PUT http://localhost:3000/api/generated/zod-controller-and-service-entities/:id
    class updateZodControllerAndServiceEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateZodControllerAndServiceEntity_Query(TypedDict):
        q: str
    class updateZodControllerAndServiceEntity_Params(TypedDict):
        id: str
    @staticmethod
    def updateZodControllerAndServiceEntity(
        body: ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity_Body, 
        query: ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity_Query,
        params: ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity_Params,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerAndServiceEntityRPC',
            handler_name='updateZodControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity POST http://localhost:3000/api/generated/zod-controller-and-service-entities/

    @staticmethod
    def createZodControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerAndServiceEntityRPC',
            handler_name='createZodControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity DELETE http://localhost:3000/api/generated/zod-controller-and-service-entities/:id

    @staticmethod
    def deleteZodControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='ZodControllerAndServiceEntityRPC',
            handler_name='deleteZodControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class YupControllerOnlyEntityRPC: 
    # YupControllerOnlyEntityRPC.getYupControllerOnlyEntities GET http://localhost:3000/api/generated/yup-controller-only-entities/
    class getYupControllerOnlyEntities_Query(TypedDict):
        search: Optional[str]
    @staticmethod
    def getYupControllerOnlyEntities(
        body: None, 
        query: YupControllerOnlyEntityRPC.getYupControllerOnlyEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerOnlyEntityRPC',
            handler_name='getYupControllerOnlyEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity PUT http://localhost:3000/api/generated/yup-controller-only-entities/:id
    class updateYupControllerOnlyEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateYupControllerOnlyEntity_Query(TypedDict):
        q: Optional[str]
    @staticmethod
    def updateYupControllerOnlyEntity(
        body: YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity_Body, 
        query: YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerOnlyEntityRPC',
            handler_name='updateYupControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerOnlyEntityRPC.createYupControllerOnlyEntity POST http://localhost:3000/api/generated/yup-controller-only-entities/

    @staticmethod
    def createYupControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerOnlyEntityRPC',
            handler_name='createYupControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity DELETE http://localhost:3000/api/generated/yup-controller-only-entities/:id

    @staticmethod
    def deleteYupControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerOnlyEntityRPC',
            handler_name='deleteYupControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class YupControllerAndServiceEntityRPC: 
    # YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities GET http://localhost:3000/api/generated/yup-controller-and-service-entities/
    class getYupControllerAndServiceEntities_Query(TypedDict):
        search: Optional[str]
    @staticmethod
    def getYupControllerAndServiceEntities(
        body: None, 
        query: YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerAndServiceEntityRPC',
            handler_name='getYupControllerAndServiceEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity PUT http://localhost:3000/api/generated/yup-controller-and-service-entities/:id
    class updateYupControllerAndServiceEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateYupControllerAndServiceEntity_Query(TypedDict):
        q: Optional[str]
    @staticmethod
    def updateYupControllerAndServiceEntity(
        body: YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity_Body, 
        query: YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerAndServiceEntityRPC',
            handler_name='updateYupControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity POST http://localhost:3000/api/generated/yup-controller-and-service-entities/

    @staticmethod
    def createYupControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerAndServiceEntityRPC',
            handler_name='createYupControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity DELETE http://localhost:3000/api/generated/yup-controller-and-service-entities/:id

    @staticmethod
    def deleteYupControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='YupControllerAndServiceEntityRPC',
            handler_name='deleteYupControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class DtoControllerOnlyEntityRPC: 
    # DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities GET http://localhost:3000/api/generated/dto-controller-only-entities/
    class getDtoControllerOnlyEntities_Query(TypedDict):
        search: str
    @staticmethod
    def getDtoControllerOnlyEntities(
        body: None, 
        query: DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerOnlyEntityRPC',
            handler_name='getDtoControllerOnlyEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity PUT http://localhost:3000/api/generated/dto-controller-only-entities/:id
    class updateDtoControllerOnlyEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateDtoControllerOnlyEntity_Query(TypedDict):
        q: str
    @staticmethod
    def updateDtoControllerOnlyEntity(
        body: DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity_Body, 
        query: DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerOnlyEntityRPC',
            handler_name='updateDtoControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity POST http://localhost:3000/api/generated/dto-controller-only-entities/

    @staticmethod
    def createDtoControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerOnlyEntityRPC',
            handler_name='createDtoControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity DELETE http://localhost:3000/api/generated/dto-controller-only-entities/:id

    @staticmethod
    def deleteDtoControllerOnlyEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerOnlyEntityRPC',
            handler_name='deleteDtoControllerOnlyEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    
class DtoControllerAndServiceEntityRPC: 
    # DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities GET http://localhost:3000/api/generated/dto-controller-and-service-entities/
    class getDtoControllerAndServiceEntities_Query(TypedDict):
        search: str
    @staticmethod
    def getDtoControllerAndServiceEntities(
        body: None, 
        query: DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerAndServiceEntityRPC',
            handler_name='getDtoControllerAndServiceEntities',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity PUT http://localhost:3000/api/generated/dto-controller-and-service-entities/:id
    class updateDtoControllerAndServiceEntity_Body(TypedDict):
        foo: Literal["bar", "baz"]
    class updateDtoControllerAndServiceEntity_Query(TypedDict):
        q: str
    @staticmethod
    def updateDtoControllerAndServiceEntity(
        body: DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity_Body, 
        query: DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity_Query,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerAndServiceEntityRPC',
            handler_name='updateDtoControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity POST http://localhost:3000/api/generated/dto-controller-and-service-entities/

    @staticmethod
    def createDtoControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerAndServiceEntityRPC',
            handler_name='createDtoControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    # DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity DELETE http://localhost:3000/api/generated/dto-controller-and-service-entities/:id

    @staticmethod
    def deleteDtoControllerAndServiceEntity(
        body: None, 
        query: None,
        params: None,
        api_root: str | None = None
    ) -> Any:
        """ 
        No summary
        """
        return api_client.request(
            segment_name='generated',
            controller_name='DtoControllerAndServiceEntityRPC',
            handler_name='deleteDtoControllerAndServiceEntity',
            body=body,
            query=query,
            params=params,
            api_root=api_root
        )
        
    

