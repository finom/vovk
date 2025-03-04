import unittest
from typing import Any, Generator
from jsonschema import ValidationError
from generated_test_python_client import HttpException, WithDtoClientControllerRPC

def noop(*args: Any) -> None: # type: ignore
    pass

class TestDto(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithDtoClientControllerRPC.infer_handle_all_output = WithDtoClientControllerRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithDtoClientControllerRPC.infer_handle_all_body = data['body']
        query: WithDtoClientControllerRPC.infer_handle_all_query = data['query']
        params: WithDtoClientControllerRPC.infer_handle_all_params = data['params']
        vovkParams: WithDtoClientControllerRPC.infer_handle_all_params = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithDtoClientControllerRPC.infer_handle_body_body = WithDtoClientControllerRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_body(
                body={"hellox": "world"}  # type: ignore
            )
        self.assertIn("'hello' is a required property", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_body(
                body={"hellox": "world"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body on server for http://\S+\. hello must be equal to world, hello must be a string")
    
    def test_query(self) -> None:
        data: WithDtoClientControllerRPC.infer_handle_query_query = WithDtoClientControllerRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_query(
                query={"searchx": "value"}  # type: ignore
            )
        self.assertIn("'search' is a required property", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_query(
                query={"searchx": "value"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid query on server for http://\S+\. search must be equal to value, search must be a string")
    
    def test_params(self) -> None:
        data: WithDtoClientControllerRPC.infer_handle_params_params = WithDtoClientControllerRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_params(
                params={"foo": "foo"}  # type: ignore
            )
        self.assertIn("'bar' is a required property", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_params(
                params={"foo": "foo"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid params on server for http://\S+\. bar must be equal to bar")

    def test_output(self) -> None:
        data: WithDtoClientControllerRPC.infer_handle_output_output = WithDtoClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithDtoClientControllerRPC.handle_output(
                query={"helloOutput": "worldx"},
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid output on server for http://\S+\. hello must be equal to world")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithDtoClientControllerRPC.infer_handle_stream_iteration, None, None] = WithDtoClientControllerRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithDtoClientControllerRPC.handle_stream(
            query={ "values": ['e', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid iteration on server for http://\S+\. value must be one of the following values: a, b, c, d")


if __name__ == "__main__":
    unittest.main()

