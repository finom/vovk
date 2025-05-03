import unittest
from typing import Any, Generator
from jsonschema import ValidationError
from generated_test_python_client.src.generated_python_client import HttpException, WithDtoClientControllerRPC

def noop(*args: Any) -> None: # type: ignore
    pass

class TestDto(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithDtoClientControllerRPC.HandleAllOutput = WithDtoClientControllerRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithDtoClientControllerRPC.HandleAllBody = data['body']
        query: WithDtoClientControllerRPC.HandleAllQuery = data['query']
        params: WithDtoClientControllerRPC.HandleAllParams = data['params']
        vovkParams: WithDtoClientControllerRPC.HandleAllParams = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithDtoClientControllerRPC.HandleBodyBody = WithDtoClientControllerRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}  # type: ignore
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_body(
                body={"hello": "wrong_length"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body on server for http://\S+\. hello must be shorter than or equal to 5 characters")
    
    def test_query(self) -> None:
        data: WithDtoClientControllerRPC.HandleQueryQuery = WithDtoClientControllerRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_query(
                query={"search": "wrong_length"}  # type: ignore
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_query(
                query={"search": "wrong_length"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid query on server for http://\S+\. search must be shorter than or equal to 5 characters")
    
    def test_params(self) -> None:
        data: WithDtoClientControllerRPC.HandleParamsParams = WithDtoClientControllerRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithDtoClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"}  # type: ignore
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithDtoClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid params on server for http://\S+\. bar must be shorter than or equal to 5 characters")

    def test_output(self) -> None:
        data: WithDtoClientControllerRPC.HandleOutputOutput = WithDtoClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithDtoClientControllerRPC.handle_output(
                query={"helloOutput": "worldx"},
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid output on server for http://\S+\. hello must be shorter than or equal to 5 characters")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithDtoClientControllerRPC.HandleStreamIteration, None, None] = WithDtoClientControllerRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithDtoClientControllerRPC.handle_stream(
            query={ "values": ['wrong_length', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid iteration #0 on server for http://\S+\. value must be one of the following values: a, b, c, d")


if __name__ == "__main__":
    unittest.main()

