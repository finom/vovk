from python import WithZodClientControllerRPC, StreamingGeneratorControllerRPC, ServerError
from jsonschema.exceptions import ValidationError
import requests

# ---------------------------
# Example usage
# ---------------------------
if __name__ == "__main__":
    base_url = "http://localhost:3000/api"

    try:
        # Suppose we have a dynamically generated class "WithZodClientControllerRPC"
        # and a method "postWithBodyQueryAndParams"

        # 1) Non-streaming usage: returns a dict (parsed JSON) or text, etc.
        resp_data = WithZodClientControllerRPC.postWithBodyQueryAndParams(
            base_url,
            query={'hey': 'query'},
            body={'hello': 'body'},
            params={'foo': 'bar'}
        )
        # resp_data will be either JSON (Python dict) or text, depending on the content type
        print("Non-streaming response:", resp_data)

        # 2) Streaming usage: if endpoint returns 'x-vovk-stream: true'
        #    we'll get a generator
        stream_data = StreamingGeneratorControllerRPC.getWithStreaming(
            base_url,
            query={'query': 'streamme'},
            body=None,
            params=None
        )

        # Check if it's a generator
        if hasattr(stream_data, '__iter__'):
            print("\nStreaming data:")
            for item in stream_data:
                print("Got item:", item)
        else:
            # It's not streaming, so it's just the final data
            print("\nGot a non-stream response for streaming endpoint:", stream_data)

    except ServerError as se:
        print("ServerError caught:", se)
        print("Status code:", se.status_code)
        print("Message:", se.server_message)

    except ValidationError as ve:
        print("Client-side validation error:", ve.message)

    except requests.HTTPError as he:
        print("HTTP error:", he)
