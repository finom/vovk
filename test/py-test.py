from python import WithZodClientControllerRPC, StreamingGeneratorControllerRPC, ServerError
from jsonschema.exceptions import ValidationError
import requests


# --------------------------------------------------------------------
# EXAMPLE USAGE:
# --------------------------------------------------------------------
if __name__ == "__main__":
    base_url = "http://localhost:3000/api"

    # Suppose "WithZodClientControllerRPC" is one of your dynamically built controllers
    # and "streamResponse" is a handler that returns x-vovk-stream: true in the response.

    try:
        # 1) Non-streaming usage (assume server doesn't send x-vovk-stream)
        resp = WithZodClientControllerRPC.postWithBodyQueryAndParams(
            base_url,
            query={'hey': 'query'},
            body={'hello': 'body'},
            params={'foo': 'bar'}
        )
        # If not streaming, 'resp' is a requests.Response
        print("Non-streaming response JSON:", resp.json())

        # 2) Streaming usage
        #    Suppose this endpoint sets `x-vovk-stream:true` in the response
        #    and sends newline-delimited JSON objects.
        stream = StreamingGeneratorControllerRPC.getWithStreaming(
            base_url,
            query={'query': 'streamme'},
            body=None,
            params=None
        )

        # If streaming is detected, the return value is a generator you can iterate over:
        if hasattr(stream, "__iter__"):
            print("Streaming data chunks:")
            for item in stream:
                print("Got item:", item)
        else:
            # Possibly the server responded with 2xx but not x-vovk-stream
            # => 'stream' is just the raw requests.Response
            print("Server did not provide streaming; got:", stream.json())

    except ServerError as se:
        print("ServerError caught:")
        print("Status code:", se.status_code)
        print("Message:", se.server_message)

    except ValidationError as ve:
        print("Client-side validation error:", ve.message)

    except requests.HTTPError as he:
        print("HTTP error:", he)
