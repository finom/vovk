import unittest
from typing import Generator, cast, List
from jsonschema import ValidationError
from generated_python_client.src.test_generated_python_client import HttpException, WithValidationRPC
from utils import noop, get_constraining_object
from io import BytesIO

class TestValidation(unittest.TestCase):
    def test_ok(self) -> None:
        # Create an instance of the API client with the back-end URL
        data: WithValidationRPC.HandleAllOutput = WithValidationRPC.handle_all(
            body={"hello": "world"},
            query={"search": "value"},
            params={"foo": "foo", "bar": "bar"},
        )
        
        # Check types
        body: WithValidationRPC.HandleAllBody = data['body']
        query: WithValidationRPC.HandleAllQuery = data['query']
        params: WithValidationRPC.HandleAllParams = data['params']
        vovkParams: WithValidationRPC.HandleAllParams = data['vovkParams']
        noop(body, query, params, vovkParams)
        
        # Check that the response matches the expected value
        self.assertEqual(data, {
            'body': {'hello': 'world'},
            'query': {'search': 'value'},
            'params': {'bar': 'bar', 'foo': 'foo'},
            'vovkParams': {'bar': 'bar', 'foo': 'foo'}
        })
    def test_body(self) -> None:
        data: WithValidationRPC.HandleBodyBody = WithValidationRPC.handle_body(
            body={"hello": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(ValidationError) as context:
            WithValidationRPC.handle_body(
                body={"hello": "wrong_length"}
            )
            self.assertIn("'wrong_length' is too long", str(context.exception).lower())


        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_body(
                body={"hello": "wrong_length"}, 
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body: .*hello.*")
    
    def test_query(self) -> None:
        data: WithValidationRPC.HandleQueryQuery = WithValidationRPC.handle_query(
            query={"search": "value"}
        )
        self.assertEqual(data, {'search': 'value'})

        with self.assertRaises(ValidationError) as context:
            WithValidationRPC.handle_query(
                query={"search": "wrong_length"} 
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_query(
                query={"search": "wrong_length"},  
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid query: .*search.*")

    def test_nested_query(self) -> None:
        NESTED_QUERY_EXAMPLE: WithValidationRPC.HandleNestedQueryQuery = {
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

        data: WithValidationRPC.HandleNestedQueryQuery = WithValidationRPC.handle_nested_query(
            query=NESTED_QUERY_EXAMPLE
        )
        self.assertEqual(data, NESTED_QUERY_EXAMPLE)

        with self.assertRaises(HttpException) as context1:
            WithValidationRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context1.exception), r"Validation failed\. Invalid query: .*at x.*")

        with self.assertRaises(ValidationError) as context2:
            WithValidationRPC.handle_nested_query(
                query={**NESTED_QUERY_EXAMPLE, "x": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context2.exception))
    
    def test_params(self) -> None:
        data: WithValidationRPC.HandleParamsParams = WithValidationRPC.handle_params(
            params={"foo": "foo", "bar": "bar"}
        )
        self.assertEqual(data, {'bar': 'bar', 'foo': 'foo'})

        with self.assertRaises(ValidationError) as context:
            WithValidationRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"}
            )
        self.assertIn("'wrong_length' is too long", str(context.exception).lower())

        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_params(
                params={"foo": "foo", "bar": "wrong_length"},
                disable_client_validation=True
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid params: .*bar.*")

    def test_output(self) -> None:
        data: WithValidationRPC.HandleOutputOutput = WithValidationRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        with self.assertRaises(HttpException) as context:
            WithValidationRPC.handle_output(
                query={"helloOutput": "wrong_length"},
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid output: .*hello.*")

    def test_form(self) -> None:
        data: WithValidationRPC.HandleMultipartDataOnlyOutput = WithValidationRPC.handle_multipart_data_only(
            body={"hello": "world"},
            query={"search": "value"},
        )
        self.assertEqual(data, {'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_multipart_data_only(
                body={"hello": "wrong_length"},
                query={"search": "value"},
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body: .*hello.*")

    def test_form_with_file(self) -> None:
        file_content = "file_text_content"
        file_data = BytesIO(file_content.encode('utf-8'))

        data: WithValidationRPC.HandleMultipartDataWithFileOutput = WithValidationRPC.handle_multipart_data_with_file(
            body={"hello": "world"},
            query={"search": "value"},
            files={"file": ('filename.txt', file_data, 'text/plain')}
        )
        self.assertEqual(data, {'file': 'file_text_content', 'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_multipart_data_with_file(
                body={"hello": "wrong_length"},
                query={"search": "value"},
                files={"file": ('filename.txt', file_data, 'text/plain')}
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body: .*hello.*")

    def test_form_with_multiple_files(self) -> None:
        file_content1 = "file_text_content1"
        file_data1 = BytesIO(file_content1.encode('utf-8'))

        file_content2 = "file_text_content2"
        file_data2 = BytesIO(file_content2.encode('utf-8'))

        data: WithValidationRPC.HandleMultipartDataWithMultipleFilesOutput = WithValidationRPC.handle_multipart_data_with_multiple_files(
            body={"hello": "world"},
            query={"search": "value"},
            files=[
                ('files', ('filename1.txt', file_data1, 'text/plain')),
                ('files', ('filename2.txt', file_data2, 'text/plain'))
            ]
        )
        self.assertEqual(data, {'files': ['file_text_content1', 'file_text_content2'], 'hello': 'world', 'search': 'value'})

        with self.assertRaises(HttpException) as context2:
            WithValidationRPC.handle_multipart_data_with_multiple_files(
                body={"hello": "wrong_length"},
                query={"search": "value"},
                files=[
                    ('files', ('filename1.txt', file_data1, 'text/plain')),
                    ('files', ('filename2.txt', file_data2, 'text/plain'))
                ]
            )
        self.assertRegex(str(context2.exception), r"Validation failed\. Invalid body: .*hello.*")

    def test_stream(self) -> None: ## TODO: StreamException????
        iterator: Generator[WithValidationRPC.HandleStreamIteration, None, None] = WithValidationRPC.handle_stream(
            query={ "values": ['a', 'b', 'c', 'd'] }
        )

        for i, data in enumerate(iterator):
            self.assertEqual(data, {'value': ['a', 'b', 'c', 'd'][i]})

        iterator = WithValidationRPC.handle_stream(
            query={ "values": ['wrong_length', 'f', 'g', 'h'] }
        )

        with self.assertRaises(Exception) as context:
            for data in iterator:
                print(data)
                pass
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid iteration #0: .*value.*")

    def test_text_plain(self) -> None:
        data: WithValidationRPC.HandleTextPlainDataOutput = WithValidationRPC.handle_text_plain_data(
            body="world",
            query={"search": "value"},
        )
        self.assertEqual(data, {'hello': 'world', 'search': 'value'})

        # Client-side validation: text body is a string, validated by jsonschema (maxLength: 5)
        with self.assertRaises(ValidationError) as context2:
            WithValidationRPC.handle_text_plain_data(
                body="wrong_length",
                query={"search": "value"},
            )
        self.assertIn("too long", str(context2.exception).lower())

        # Server-side validation: body string too long (max 5), with client validation disabled
        with self.assertRaises(HttpException) as context:
            WithValidationRPC.handle_text_plain_data(
                body="wrong_length",
                query={"search": "value"},
                disable_client_validation=True,
            )
        self.assertRegex(str(context.exception), r"Validation failed\. Invalid body")

    def test_binary_octet_stream(self) -> None:
        binary_content = b"hello binary world"
        data: WithValidationRPC.HandleBinaryOctetStreamOutput = WithValidationRPC.handle_binary_octet_stream(
            body=binary_content,
        )
        self.assertEqual(data, {'size': len(binary_content), 'content': 'hello binary world'})

    def test_constraints(self) -> None:
        # List of keys that are not supported
        not_supported: List[str] = []
        
        # Get object with no constraints
        no_constraints = cast(WithValidationRPC.HandleSchemaConstraintsBody, get_constraining_object(None))
        
        # Test valid object first
        WithValidationRPC.handle_schema_constraints(body=no_constraints)
        
        # Test each key for constraints
        for key in no_constraints.keys():
            if key in not_supported:
                continue
                
            # Get object with specific constraint
            constraining_object = cast(WithValidationRPC.HandleSchemaConstraintsBody,get_constraining_object(key))
            
            # Test with client validation disabled
            with self.assertRaises(HttpException, msg='HttpException is not raised for key ' + key) as context1:
                WithValidationRPC.handle_schema_constraints(
                    body=constraining_object,
                    disable_client_validation=True
                )
            self.assertRegex(
                str(context1.exception), 
                rf"Validation failed\. Invalid body: .*{key}.*",
            )
            
            # Test with client validation enabled
            with self.assertRaises(ValidationError, msg='ValidationError is not raised for key ' + key) as context2:
                WithValidationRPC.handle_schema_constraints(
                    body=constraining_object
                )
            # WORKAROUND: "logical_anyOf" does not appear in the error message
            self.assertIn('wrong_length' if key == 'logical_anyOf' else key, str(context2.exception))
if __name__ == "__main__":
    unittest.main()

