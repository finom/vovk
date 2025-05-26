import unittest
from typing import Generator, cast
from jsonschema import ValidationError
from generated_python_client.src.test_generated_python_client import HttpException, WithDtoClientControllerRPC
from utils import noop, get_constraining_object

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
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body on server. hello must be shorter than or equal to 5 characters")
    
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
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid query on server. search must be shorter than or equal to 5 characters")
    
    def test_nested_query(self) -> None:
        NESTED_QUERY_EXAMPLE: WithDtoClientControllerRPC.HandleNestedQueryQuery = {
            'x': 'xx',
            'y': ['yy', 'uu'],
            'z': {
                'f': 'x',
                'u': ['uu', 'xx'],
                'd': {
                    'x': 'ee',
                },
            },
        }
        data: WithDtoClientControllerRPC.HandleNestedQueryQuery = WithDtoClientControllerRPC.handle_nested_query(
            query=NESTED_QUERY_EXAMPLE
        )
        self.assertEqual(data, NESTED_QUERY_EXAMPLE)

        with self.assertRaises(HttpException) as context1:
            WithDtoClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context1.exception), r"Validation failed\. Invalid query on server. x must be shorter.*")

        with self.assertRaises(ValidationError) as context2:
            WithDtoClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context2.exception))
    
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
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid params on server. bar must be shorter than or equal to 5 characters")

    def test_output(self) -> None:
        data: WithDtoClientControllerRPC.HandleOutputOutput = WithDtoClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithDtoClientControllerRPC.handle_output(
                query={"helloOutput": "worldx"},
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid output on server. hello must be shorter than or equal to 5 characters")

    def test_stream(self) -> None: ## TODO: StreamException???
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
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid iteration #0 on server. value must be one of the following values: a, b, c, d")

    def test_constraints(self) -> None:
        # List of keys that are not supported
        not_supported = [
            'logical_anyOf',
            'logical_allOf',
            'obj_strict',
            'obj_required',
            'num_multipleOf',
            'num_exclusiveMinimum',
            'num_exclusiveMaximum',
            # WARNING: Doesn't perform validation on the Python client side, but on the server side only
            'str_datetime',
        ]
        
        # Get object with no constraints
        no_constraints = cast(WithDtoClientControllerRPC.HandleSchemaConstraintsBody, get_constraining_object(None))
        
        # Test valid object first
        WithDtoClientControllerRPC.handle_schema_constraints(body=no_constraints)
        
        # Test each key for constraints
        for key in no_constraints.keys():
            if key in not_supported:
                continue
                
            # Get object with specific constraint
            constraining_object = cast(WithDtoClientControllerRPC.HandleSchemaConstraintsBody,get_constraining_object(key))
            
            # Test with client validation disabled
            with self.assertRaises(HttpException, msg='HttpException is not raised for key ' + key) as context1:
                WithDtoClientControllerRPC.handle_schema_constraints(
                    body=constraining_object,
                    disable_client_validation=True
                )
            self.assertRegex(
                str(context1.exception), 
                rf"Validation failed\. Invalid body on server. {key}.*",
            )
            
            # Test with client validation enabled
            with self.assertRaises(ValidationError, msg='ValidationError is not raised for key ' + key) as context2:
                WithDtoClientControllerRPC.handle_schema_constraints(
                    body=constraining_object
                )
            self.assertIn(key, str(context2.exception))
if __name__ == "__main__":
    unittest.main()

