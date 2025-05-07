import unittest
from typing import Any, Generator
from jsonschema import ValidationError
from generated_python_client.src.test_generated_python_client import HttpException, WithYupClientControllerRPC

def noop(*args: Any) -> None: # type: ignore
    pass

class TestYup(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithYupClientControllerRPC.HandleAllOutput = WithYupClientControllerRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithYupClientControllerRPC.HandleAllBody = data['body']
        query: WithYupClientControllerRPC.HandleAllQuery = data['query']
        params: WithYupClientControllerRPC.HandleAllParams = data['params']
        vovkParams: WithYupClientControllerRPC.HandleAllParams = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithYupClientControllerRPC.HandleBodyBody = WithYupClientControllerRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithYupClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}  # type: ignore
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithYupClientControllerRPC.handle_body(
                body={"hello": "wrong_length"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Yup validation failed\. Invalid body on server for http://\S+\. hello must be at most 5 characters")
    
    def test_query(self) -> None:
        data: WithYupClientControllerRPC.HandleQueryQuery = WithYupClientControllerRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithYupClientControllerRPC.handle_query(
                query={"search": "wrong_length"}  # type: ignore
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithYupClientControllerRPC.handle_query(
                query={"search": "wrong_length"},  # type: ignore
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Yup validation failed\. Invalid query on server for http://\S+\. search must be at most 5 characters")
    
    def test_nested_query(self) -> None:
        NESTED_QUERY_EXAMPLE: WithYupClientControllerRPC.HandleNestedQueryQuery = {
            'x': 'xx',
            'y': ['yy', 'uu'],
            'z': {
                'f': 'x',
                'u': ['uu', 'xx'],
                'd': {
                'x': 'ee',
                'arrOfObjects': [
                    {
                    'foo': 'bar',
                    'nestedArr': ['one', 'two', 'three'],
                    'nestedObj': {
                        'deepKey': 'deepValue1',
                    },
                    },
                    {
                    'foo': 'baz',
                    'nestedArr': ['four', 'five', 'six'], # WARNING: couldn't omit this field even if it is optional
                    'nestedObj': { # WARNING: couldn't omit this field even if it is optional
                        'deepKey': 'deepValue2',
                    },
                    },
                ],
                },
            },
        }

        data: WithYupClientControllerRPC.HandleNestedQueryQuery = WithYupClientControllerRPC.handle_nested_query(
            query=NESTED_QUERY_EXAMPLE
        )
        self.assertEqual(data, NESTED_QUERY_EXAMPLE)

        with self.assertRaises(HttpException) as context1:
            WithYupClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context1.exception), r"Yup validation failed\. Invalid query on server for http://\S+\. x must be.*")

        with self.assertRaises(ValidationError) as context2:
            WithYupClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context2.exception))
    
    def test_params(self) -> None:
        data: WithYupClientControllerRPC.HandleParamsParams = WithYupClientControllerRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithYupClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"} 
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithYupClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Yup validation failed\. Invalid params on server for http://\S+\. bar must be at most 5 characters")

    def test_output(self) -> None:
        data: WithYupClientControllerRPC.HandleOutputOutput = WithYupClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithYupClientControllerRPC.handle_output(
                query={"helloOutput": "wrong_length"}
            )
        self.assertRegex(str(context.exception), r"Yup validation failed\. Invalid output on server for http://\S+\. hello must be at most 5 characters")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithYupClientControllerRPC.HandleStreamIteration, None, None] = WithYupClientControllerRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithYupClientControllerRPC.handle_stream(
            query={ "values": ['wrong_length', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Yup validation failed\. Invalid iteration #0 on server for http://\S+\. value must be at most 5 characters")


if __name__ == "__main__":
    unittest.main()

