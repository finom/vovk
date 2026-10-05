import unittest
from typing import Generator, cast, List
from jsonschema import ValidationError
from generated_python_client.src.test_generated_python_client import ClientSweepRPC, HttpException, WithValidationRPC
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

    def test_params_encoding(self) -> None:
        # a slash, a space or a query character stays inside its path parameter
        data = WithValidationRPC.handle_params(params={"foo": "a/b", "bar": "c d?"})
        self.assertEqual(data, {'foo': 'a/b', 'bar': 'c d?'})

        with self.assertRaises(ValueError):
            WithValidationRPC.handle_params(params={"foo": "..", "bar": "x"})

        # an empty segment would reach another route, or a redirect to one
        with self.assertRaises(ValueError):
            WithValidationRPC.handle_params(params={"foo": "", "bar": "x"}, disable_client_validation=True)

    def test_query_encoding(self) -> None:
        data = WithValidationRPC.handle_query(query={"search": "a&b=c"})
        self.assertEqual(data, {'search': 'a&b=c'})

    def test_query_list_with_none(self) -> None:
        # None is left out and the next item takes its index: the server reads indexes with a gap as an object
        iterator = WithValidationRPC.handle_stream(
            query={"values": [None, "a", None, "b"]},  # type: ignore
            disable_client_validation=True,
        )
        self.assertEqual(list(iterator), [{'value': 'a'}, {'value': 'b'}])

    def test_output(self) -> None:
        data: WithValidationRPC.HandleOutputOutput = WithValidationRPC.handle_output(
            query={"helloOutput": "world"}
        )
        self.assertEqual(data, {'hello': 'world'})

        # invalid output is the handler's bug: the production server answers 500 and keeps the issues
        with self.assertRaises(HttpException) as context:
            WithValidationRPC.handle_output(
                query={"helloOutput": "wrong_length"},
            )
        self.assertEqual(context.exception.status_code, 500)
        self.assertEqual(str(context.exception), "Internal server error")

    def test_falsy_output(self) -> None:
        self.assertIs(WithValidationRPC.handle_falsy_output(query={"type": "boolean"}), False)
        self.assertEqual(WithValidationRPC.handle_falsy_output(query={"type": "number"}), 0)
        self.assertEqual(WithValidationRPC.handle_falsy_output(query={"type": "string"}), '')

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
        self.assertEqual(str(context.exception), "Internal server error")

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

    def test_union_body(self) -> None:
        data = WithValidationRPC.handle_octet_stream_or_json_data(body={"hello": "world"})
        self.assertEqual(data, {'type': 'none', 'hello': 'world'})

    def test_union_body_file(self) -> None:
        # the file branch of a file-or-JSON body goes out as the binary type the procedure declares
        data = WithValidationRPC.handle_octet_stream_or_json_data(body=b'abc')
        self.assertEqual(data, {'type': 'image/png', 'hello': 'none'})

    def test_javascript_patterns(self) -> None:
        # z.emoji(), /^\p{L}+$/u, a named group and \u{...}: valid JavaScript patterns that Python's re can't compile
        body: ClientSweepRPC.PostPatternsBody = {'emoji': '😀', 'letters': 'Zoë', 'user': 'ab@x', 'smile': '😀'}
        self.assertEqual(ClientSweepRPC.post_patterns(body=body), body)

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

