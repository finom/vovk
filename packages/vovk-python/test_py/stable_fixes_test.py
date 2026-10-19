import sys
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer
from importlib.util import find_spec
from io import BytesIO
from typing import Any, Iterator, List, cast
from contextlib import contextmanager

from jsonschema.exceptions import ValidationError
from generated_python_client.src.test_generated_python_client import (
    ClientSweepRPC,
    CommonControllerRPC,
    HttpException,
    PetstoreAPI,
    StreamingControllerRPC,
    WithValidationRPC,
)
from utils import get_constraining_object


class TestBodyAndQueryWithoutASchema(unittest.TestCase):
    # a procedure that emits no body or query schema still reads them, as the TypeScript client sends them
    def test_body_and_query_of_a_procedure_without_their_schemas(self) -> None:
        data = WithValidationRPC.skip_schema_emission_bool(body={'hello': 'world'}, query={'search': 'value'})
        self.assertEqual(data, {'body': {'hello': 'world'}, 'search': 'value'})

    def test_body_and_query_of_a_procedure_without_a_schema(self) -> None:
        data = CommonControllerRPC.post_with_all(
            body={'isBody': True}, query={'simpleQueryParam': 'queryValue'}, params={'hello': 'world'}
        )
        self.assertEqual(
            data, {'params': {'hello': 'world'}, 'body': {'isBody': True}, 'query': {'simpleQueryParam': 'queryValue'}}
        )

    def test_streamed_body_without_a_schema(self) -> None:
        tokens = list(StreamingControllerRPC.post_with_streaming(body=[{'token': 'a'}], query={'query': 'queryValue'}))
        self.assertEqual(tokens, [{'token': 'a', 'query': 'queryValue'}])


class TestFormValidation(unittest.TestCase):
    # a form body is checked as an object before it is sent, as the TypeScript client checks it
    def test_urlencoded_body(self) -> None:
        with self.assertRaises(ValidationError):
            WithValidationRPC.handle_url_encoded_data(body={'hello': 'toolong'}, query={'search': 'value'})

    def test_multipart_body(self) -> None:
        with self.assertRaises(ValidationError):
            WithValidationRPC.handle_multipart_data_only(body={'hello': 'toolong'}, query={'search': 'value'})

    def test_multipart_body_with_files(self) -> None:
        with self.assertRaises(ValidationError):
            WithValidationRPC.handle_multipart_data_with_file(
                body={'hello': 'toolong'}, query={'search': 'value'}, files={'file': ('a.txt', BytesIO(b'a'))}
            )
        data = WithValidationRPC.handle_multipart_data_with_file(
            body={'hello': 'world'}, query={'search': 'value'}, files={'file': ('a.txt', BytesIO(b'a'))}
        )
        self.assertEqual(data, {'hello': 'world', 'file': 'a', 'search': 'value'})

    # the server takes this form as sent, so only the client checks it
    def test_typed_multipart_body(self) -> None:
        files = [('files', ('a.pdf', BytesIO(b'a')))]
        with self.assertRaises(ValidationError):
            ClientSweepRPC.post_multipart_typed(body={'age': 'abc'}, files=files)  # type: ignore[typeddict-item]
        data = ClientSweepRPC.post_multipart_typed(body={'age': 5}, files=[('files', ('a.pdf', BytesIO(b'a')))])
        self.assertEqual(data, {'age': '5', 'files': ['file:a.pdf']})

    def test_without_client_validation_the_server_checks(self) -> None:
        with self.assertRaises(HttpException) as context:
            WithValidationRPC.handle_url_encoded_data(
                body={'hello': 'toolong'}, query={'search': 'value'}, disable_client_validation=True
            )
        self.assertEqual(context.exception.status_code, 400)


class TestFilesOfAFreeFormMultipartBody(unittest.TestCase):
    # a record body takes any field, files too, as a TypeScript FormData does
    def test_files_with_a_record_body(self) -> None:
        entries = ClientSweepRPC.post_form_entries(body={'a': 'b'}, files={'f': ('naïve file.txt', BytesIO(b'x'))})
        self.assertEqual(entries, [['a', 'b'], ['f', 'file:naïve file.txt']])
        entries = ClientSweepRPC.post_form_entries(body={}, files=[('f', ('one.txt', BytesIO(b'1')))])
        self.assertEqual(entries, [['f', 'file:one.txt']])


class RawRequestLine(BaseHTTPRequestHandler):
    lines: List[str] = []

    def do_GET(self) -> None:
        RawRequestLine.lines.append(self.requestline)
        body = b'null'
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args: Any) -> None:
        pass


@contextmanager
def raw_server() -> Iterator[str]:
    server = HTTPServer(('127.0.0.1', 0), RawRequestLine)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f'http://127.0.0.1:{server.server_address[1]}'
    finally:
        server.shutdown()
        server.server_close()


class TestPipeDelimitedOnTheWire(unittest.TestCase):
    # the request line a server reads: the delimiter as a |, a | inside a value encoded, as the TypeScript client sends
    def test_pipe_delimiter_reaches_the_server_as_is(self) -> None:
        RawRequestLine.lines = []
        with raw_server() as root:
            PetstoreAPI.get_styled(query={'pipe': ['a', 'b|c'], 'tags': ['x|y']}, api_root=root)
            # a call without a styled delimiter, after it, is encoded as before
            PetstoreAPI.get_styled(query={'tags': ['x|y']}, api_root=root)
        self.assertEqual(
            RawRequestLine.lines,
            ['GET /styled?pipe=a|b%7Cc&tags=x%7Cy HTTP/1.1', 'GET /styled?tags=x%7Cy HTTP/1.1'],
        )


def with_url(url: str) -> WithValidationRPC.HandleSchemaConstraintsBody:
    return cast(WithValidationRPC.HandleSchemaConstraintsBody, {**get_constraining_object(None), 'str_url': url})


class TestURLFormat(unittest.TestCase):
    # as zod's z.url() takes a URL: whatever the WHATWG URL parser reads, with a scheme
    def test_urls_the_server_takes(self) -> None:
        for url in (
            'https://example.com/ä',
            'https://例え.jp/',
            'https://example.com/a b',
            'https://example.com/?q=a|b',
            'https://example.com/%zz',
            'mailto:someone@example.com',
            'http://[::1]:8080/x',
        ):
            with self.subTest(url=url):
                data = WithValidationRPC.handle_schema_constraints(body=with_url(url))
                self.assertEqual(data['str_url'], url)

    def test_urls_the_server_refuses(self) -> None:
        for url in ('not-a-url', 'https://', 'https://exa mple.com/', 'http://example.com:99999/', '//example.com/'):
            with self.subTest(url=url):
                with self.assertRaises(ValidationError):
                    WithValidationRPC.handle_schema_constraints(body=with_url(url))
                with self.assertRaises(HttpException):
                    WithValidationRPC.handle_schema_constraints(
                        body=with_url(url), disable_client_validation=True
                    )


class TestTypedDictForPydantic(unittest.TestCase):
    # pydantic reads a TypedDict only from typing_extensions before Python 3.12
    def test_typed_dict_comes_from_typing_extensions_before_3_12(self) -> None:
        module = type(WithValidationRPC.HandleAllBody).__module__
        self.assertEqual(module, 'typing' if sys.version_info >= (3, 12) else 'typing_extensions')

    @unittest.skipIf(find_spec('pydantic') is None, 'pydantic not installed')
    def test_pydantic_validates_a_generated_typed_dict(self) -> None:
        from pydantic import TypeAdapter, ValidationError as PydanticValidationError  # type: ignore[import-not-found, unused-ignore]

        adapter: Any = TypeAdapter(ClientSweepRPC.GetEchoQuery)
        self.assertEqual(adapter.validate_python({'q': 'x'}), {'q': 'x'})
        with self.assertRaises(PydanticValidationError):
            adapter.validate_python({})


if __name__ == '__main__':
    unittest.main()
