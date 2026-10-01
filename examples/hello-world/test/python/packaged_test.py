import unittest
from vovk_hello_world import UserRPC, OpenApiRPC, StreamRPC

class TestPackagedRPC(unittest.TestCase):
    def test_update_user(self) -> None:
        body: UserRPC.UpdateUserBody = {
            "email": "john@example.com",
            "profile": {"name": "John Doe", "age": 25},
        }
        query: UserRPC.UpdateUserQuery = {"notify": "email"}
        params: UserRPC.UpdateUserParams = {
            "id": "123e4567-e89b-12d3-a456-426614174000"
        }
        update_user_response = UserRPC.update_user(params=params, body=body, query=query)
        self.assertIsInstance(update_user_response, dict)

    def test_openapi_spec(self) -> None:
        openapi_response = OpenApiRPC.get_spec()
        self.assertIn("info", openapi_response)
        self.assertIn("title", openapi_response["info"])
        self.assertIn("version", openapi_response["info"])

    def test_stream_tokens(self) -> None:
        stream_response = StreamRPC.stream_tokens()
        messages: list[str] = []
        for item in stream_response:
            self.assertIn("message", item)
            messages.append(item["message"])
            print(item["message"], end="", flush=True)
        print()
        self.assertTrue(messages)

if __name__ == "__main__":
    unittest.main()

