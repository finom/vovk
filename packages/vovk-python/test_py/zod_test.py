import unittest
from typing import Generator, cast, List
from jsonschema import ValidationError
from generated_python_client.src.test_generated_python_client import HttpException, WithZodClientControllerRPC
from utils import noop, get_constraining_object
from io import BytesIO

class TestZod(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithZodClientControllerRPC.HandleAllOutput = WithZodClientControllerRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithZodClientControllerRPC.HandleAllBody = data['body']
        query: WithZodClientControllerRPC.HandleAllQuery = data['query']
        params: WithZodClientControllerRPC.HandleAllParams = data['params']
        vovkParams: WithZodClientControllerRPC.HandleAllParams = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithZodClientControllerRPC.HandleBodyBody = WithZodClientControllerRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}
            )
            self.assertIn("'wrong_length' is too long", str(context.exception).lower())


        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_body(
                body={"hello": "wrong_length"}, 
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body: .*hello.*")
    
    def test_query(self) -> None:
        data: WithZodClientControllerRPC.HandleQueryQuery = WithZodClientControllerRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_query(
                query={"search": "wrong_length"} 
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_query(
                query={"search": "wrong_length"},  
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid query: .*search.*")

    def test_nested_query(self) -> None:
        NESTED_QUERY_EXAMPLE: WithZodClientControllerRPC.HandleNestedQueryQuery = {
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

        data: WithZodClientControllerRPC.HandleNestedQueryQuery = WithZodClientControllerRPC.handle_nested_query(
            query=NESTED_QUERY_EXAMPLE
        )
        self.assertEqual(data, NESTED_QUERY_EXAMPLE)

        with self.assertRaises(HttpException) as context1:
            WithZodClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context1.exception), r"Validation failed\. Invalid query: .*at x.*")

        with self.assertRaises(ValidationError) as context2:
            WithZodClientControllerRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context2.exception))
    
    def test_params(self) -> None:
        data: WithZodClientControllerRPC.HandleParamsParams = WithZodClientControllerRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithZodClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid params: .*bar.*")

    def test_output(self) -> None:
        data: WithZodClientControllerRPC.HandleOutputOutput = WithZodClientControllerRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithZodClientControllerRPC.handle_output(
                query={"helloOutput": "wrong_length"},
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid output: .*hello.*")

    def test_form(self) -> None:
        data: WithZodClientControllerRPC.HandleFormDataOutput = WithZodClientControllerRPC.handle_form_data(
            body={"hello": "world"},
            query={"search": "value"},
        )
        self.assertEqual(data, {'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_form_data(
                body={"hello": "wrong_length"},
                query={"search": "value"},
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid form: .*hello.*")

    def test_form_with_file(self) -> None:
        file_content = "file_text_content"
        file_data = BytesIO(file_content.encode('utf-8'))

        data: WithZodClientControllerRPC.HandleFormDataWithFileOutput = WithZodClientControllerRPC.handle_form_data_with_file(
            body={"hello": "world"},
            query={"search": "value"},
            files={"file": ('filename.txt', file_data, 'text/plain')}
        )
        self.assertEqual(data, {'file': 'file_text_content', 'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_form_data_with_file(
                body={"hello": "wrong_length"},
                query={"search": "value"},
                files={"file": ('filename.txt', file_data, 'text/plain')}
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid form: .*hello.*")

    def test_form_with_multiple_files(self) -> None:
        file_content1 = "file_text_content1"
        file_data1 = BytesIO(file_content1.encode('utf-8'))

        file_content2 = "file_text_content2"
        file_data2 = BytesIO(file_content2.encode('utf-8'))

        data: WithZodClientControllerRPC.HandleFormDataWithMultipleFilesOutput = WithZodClientControllerRPC.handle_form_data_with_multiple_files(
            body={"hello": "world"},
            query={"search": "value"},
            files=[
                ('files', ('filename1.txt', file_data1, 'text/plain')),
                ('files', ('filename2.txt', file_data2, 'text/plain'))
            ]
        )
        self.assertEqual(data, {'files': ['file_text_content1', 'file_text_content2'], 'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithZodClientControllerRPC.handle_form_data_with_multiple_files(
                body={"hello": "wrong_length"},
                query={"search": "value"},
                files=[
                    ('files', ('filename1.txt', file_data1, 'text/plain')),
                    ('files', ('filename2.txt', file_data2, 'text/plain'))
                ]
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid form: .*hello.*")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithZodClientControllerRPC.HandleStreamIteration, None, None] = WithZodClientControllerRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithZodClientControllerRPC.handle_stream(
            query={ "values": ['wrong_length', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid iteration #0: .*value.*")
    def test_constraints(self) -> None:
        # List of keys that are not supported
        not_supported: List[str] = []
        
        # Get object with no constraints
        no_constraints = cast(WithZodClientControllerRPC.HandleSchemaConstraintsBody, get_constraining_object(None))
        
        # Test valid object first
        WithZodClientControllerRPC.handle_schema_constraints(body=no_constraints)
        
        # Test each key for constraints
        for key in no_constraints.keys():
            if key in not_supported:
                continue
                
            # Get object with specific constraint
            constraining_object = cast(WithZodClientControllerRPC.HandleSchemaConstraintsBody,get_constraining_object(key))
            
            # Test with client validation disabled
            with self.assertRaises(HttpException, msg='HttpException is not raised for key ' + key) as context1:
                WithZodClientControllerRPC.handle_schema_constraints(
                    body=constraining_object,
                    disable_client_validation=True
                )
            self.assertRegex(
                str(context1.exception), 
                rf"Validation failed\. Invalid body\. .*{key}.*",
            )
            
            # Test with client validation enabled
            with self.assertRaises(ValidationError, msg='ValidationError is not raised for key ' + key) as context2:
                WithZodClientControllerRPC.handle_schema_constraints(
                    body=constraining_object
                )
            # WORKAROUND: "logical_anyOf" does not appear in the error message
            self.assertIn('wrong_length' if key == 'logical_anyOf' else key, str(context2.exception))
if __name__ == "__main__":
    unittest.main()

