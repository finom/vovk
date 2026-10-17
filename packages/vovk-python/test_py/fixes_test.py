import gzip
import json
import socket
import threading
import unittest
import zlib
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List
from urllib.parse import unquote
import requests
from requests.auth import AuthBase
from urllib3.response import HTTPResponse
from generated_python_client.src.test_generated_python_client import (
    ClientRuntimeRPC,
    ClientSweepRPC,
    HttpException,
    PetstoreAPI,
    RustSweepRPC,
    WithValidationRPC,
    client,
)
from runtime_test import raw_server, read_head
from utils import fake_transport, form_fields, get_constraining_object, json_response

FAKE_ROOT = 'http://fake.test/api'
NULLABLE_BODY: Dict[str, Any] = {
    'anyOf': [{'type': 'object', 'properties': {'a': {'type': 'string'}}, 'required': ['a']}, {'type': 'null'}]
}


class TestMissingPathParams(unittest.TestCase):
    # as the TypeScript and Rust clients: a param left out or given as None fails before the request
    def test_missing_path_param(self) -> None:
        calls: Dict[str, Any] = {
            'left out': lambda: ClientSweepRPC.get_user_posts(params={}),
            'None': lambda: ClientSweepRPC.get_user_posts(params={'id': None}),  # type: ignore[dict-item]
            'misspelled': lambda: ClientSweepRPC.get_user_posts(params={'idd': '1'}),
            'None without client validation': lambda: ClientSweepRPC.get_echo(
                query={'q': 'x'}, params={'id': None}, disable_client_validation=True  # type: ignore[typeddict-item]
            ),
        }
        for name, call in calls.items():
            with self.subTest(name), fake_transport(json_response({})) as sent:
                with self.assertRaisesRegex(ValueError, r'^Missing params: id in .*/users/\{id\}/posts$|^Missing params: id in .*/echo/\{id\}$'):
                    call()
                self.assertEqual(sent, [])

    def test_one_of_two_params_missing(self) -> None:
        with fake_transport(json_response({})) as sent:
            with self.assertRaisesRegex(ValueError, r'^Missing params: foo in '):
                WithValidationRPC.handle_params(params={'foo': None, 'bar': 'x'}, disable_client_validation=True)  # type: ignore[typeddict-item]
        self.assertEqual(sent, [])

    def test_a_value_with_braces_is_sent(self) -> None:
        self.assertEqual(ClientSweepRPC.get_user_posts(params={'id': '{id}'}), {'id': '{id}'})


class TestGivenContentType(unittest.TestCase):
    # bytes have no type of their own: a Content-Type the procedure takes goes out, such as image/jpeg for image/*
    def test_a_given_type_the_procedure_takes(self) -> None:
        self.assertEqual(ClientSweepRPC.post_image(body=b'\xff\xd8\xff'), {'name': 'file', 'type': 'image/*', 'size': 3})
        for key in ('Content-Type', 'content-type'):
            with self.subTest(key):
                data = ClientSweepRPC.post_image(body=b'\xff\xd8\xff', headers={key: 'image/jpeg'})
                self.assertEqual(data, {'name': 'file', 'type': 'image/jpeg', 'size': 3})
        xml = ClientSweepRPC.post_xml(body=b'<a/>', headers={'Content-Type': 'application/xml; charset=utf-8'})
        self.assertEqual(xml, {'xml': '<a/>', 'contentType': 'application/xml; charset=utf-8'})
        csv = RustSweepRPC.post_csv(body='a,b', headers={'Content-Type': 'text/csv; charset=utf-8'})
        self.assertEqual(csv, {'contentType': 'text/csv; charset=utf-8', 'body': 'a,b'})
        wildcard = WithValidationRPC.handle_wildcard_content_type(body=b'abc', headers={'Content-Type': 'image/gif'})
        self.assertEqual(wildcard, {'size': 3, 'type': 'image/gif'})

    # a type the procedure refuses, as from a headers dict shared between calls, is still replaced by the declared one
    def test_a_given_type_the_procedure_refuses(self) -> None:
        data = ClientSweepRPC.post_octet(body=b'%PDF', headers={'Content-Type': 'application/json'})
        self.assertEqual(data, {'type': 'application/octet-stream', 'size': 4})


class TestGzipStream(unittest.TestCase):
    # requests asks for gzip and deflate, so a compressing proxy may send JSON Lines compressed
    def test_gzip_stream(self) -> None:
        for encoding, body in (('gzip', gzip.compress(b'{"i":1}\n{"i":2}\n')), ('deflate', zlib.compress(b'{"i":1}\n{"i":2}\n'))):
            with self.subTest(encoding):

                def handle(conn: socket.socket) -> None:
                    read_head(conn)
                    conn.sendall(
                        b'HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ncontent-encoding: %s\r\n'
                        b'connection: close\r\n\r\n' % encoding.encode() + body
                    )

                with raw_server(handle) as api_root:
                    self.assertEqual(list(ClientSweepRPC.get_falsy_items(api_root=api_root)), [{'i': 1}, {'i': 2}])

    def test_broken_gzip_stream(self) -> None:
        def handle(conn: socket.socket) -> None:
            read_head(conn)
            conn.sendall(
                b'HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ncontent-encoding: gzip\r\n'
                b'connection: close\r\n\r\n{"i":1}\n'
            )

        with raw_server(handle) as api_root, self.assertRaises(requests.exceptions.ContentDecodingError):
            list(ClientSweepRPC.get_falsy_items(api_root=api_root))

    @unittest.skipUnless(hasattr(HTTPResponse, 'read1'), 'urllib3 before 2.2 has no read1')
    def test_gzip_stream_yields_each_item_as_it_comes(self) -> None:
        first_taken = threading.Event()
        second_sent = threading.Event()

        def handle(conn: socket.socket) -> None:
            read_head(conn)
            compressor = zlib.compressobj(wbits=31)
            conn.sendall(
                b'HTTP/1.1 200 OK\r\ncontent-type: application/jsonl\r\ncontent-encoding: gzip\r\nconnection: close\r\n\r\n'
                + compressor.compress(b'{"i":1}\n')
                + compressor.flush(zlib.Z_SYNC_FLUSH)
            )
            first_taken.wait(3)
            second_sent.set()
            conn.sendall(compressor.compress(b'{"i":2}\n') + compressor.flush())

        with raw_server(handle) as api_root:
            items = ClientSweepRPC.get_falsy_items(api_root=api_root)
            first = next(items)
            taken_before_the_second_was_sent = not second_sent.is_set()
            first_taken.set()
            rest = list(items)

        self.assertEqual((first, rest, taken_before_the_second_was_sent), ({'i': 1}, [{'i': 2}], True))


class TestDatetime(unittest.TestCase):
    # as a Date's toJSON() writes it: in UTC with a Z, which zod's z.iso.datetime() takes
    def test_an_aware_datetime_goes_out_in_utc_with_a_z(self) -> None:
        values: Any = [
            (datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc), '2026-01-02T03:04:05Z'),
            (datetime(2026, 1, 2, 5, 4, 5, tzinfo=timezone(timedelta(hours=2))), '2026-01-02T03:04:05Z'),
            (datetime(2026, 1, 2, 3, 4, 5, 123456, tzinfo=timezone.utc), '2026-01-02T03:04:05.123456Z'),
            # its zone is unknown
            (datetime(2026, 1, 2, 3, 4, 5), '2026-01-02T03:04:05'),
        ]
        for value, text in values:
            with self.subTest(text), fake_transport(json_response(None)) as sent:
                client.make_api_request(url=f'{FAKE_ROOT}/events', http_method='POST', body={'at': value}, query={'since': value})
                self.assertEqual(json.loads(sent[0].request.body or ''), {'at': text})
                self.assertEqual(unquote(sent[0].request.url or ''), f'{FAKE_ROOT}/events?since={text}')

    def test_zod_datetime_takes_it(self) -> None:
        body = {**get_constraining_object(None), 'str_datetime': datetime(2023, 1, 1, 12, tzinfo=timezone.utc)}
        for disable_client_validation in (False, True):
            with self.subTest(disable_client_validation=disable_client_validation):
                data = WithValidationRPC.handle_schema_constraints(body=body, disable_client_validation=disable_client_validation)  # type: ignore[arg-type]
                self.assertEqual(data['str_datetime'], '2023-01-01T12:00:00Z')


class TestErrorText(unittest.TestCase):
    # as the success path and the TypeScript client read it: UTF-8 unless a charset says otherwise
    def test_error_text_is_utf8_and_the_media_type_case_insensitive(self) -> None:
        errors: List[Any] = [
            (401, 'text/plain', 'Доступ запрещён'.encode(), 'Доступ запрещён', None),
            (502, 'text/html', '<p>Zoë – 東京</p>'.encode(), '<p>Zoë – 東京</p>', None),
            (401, 'text/plain; charset=iso-8859-1', 'Zoë'.encode('latin-1'), 'Zoë', None),
            (400, 'application/problem+json', json.dumps({'detail': '€5'}, ensure_ascii=False).encode(), '€5', {'detail': '€5'}),
            (404, 'Application/JSON', b'{"message":"nope","cause":1}', 'nope', 1),
        ]
        for status, content_type, body, message, cause in errors:
            with self.subTest(content_type=content_type):
                response = (status, {'Content-Type': content_type}, body)
                with fake_transport(lambda request: response), self.assertRaises(HttpException) as context:
                    ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
                error = context.exception
                self.assertEqual((error.status_code, error.message, error.cause), (status, message, cause))


class TestNullBody(unittest.TestCase):
    # as the TypeScript client: None is the JSON body null when the body schema accepts null and takes JSON
    def test_none_for_a_body_that_accepts_null(self) -> None:
        schemas: List[Dict[str, Any]] = [
            NULLABLE_BODY,
            {'type': ['object', 'null']},
            {**NULLABLE_BODY, 'x-contentType': ['application/json']},
        ]
        for schema in schemas:
            for disable_client_validation in (False, True):
                with self.subTest(schema=schema, disable_client_validation=disable_client_validation):
                    with fake_transport(json_response(None)) as sent:
                        client.make_api_request(
                            url=f'{FAKE_ROOT}/x',
                            http_method='POST',
                            body=None,
                            validation={'body': schema},
                            disable_client_validation=disable_client_validation,
                        )
                    self.assertEqual((sent[0].request.body, sent[0].request.headers['Content-Type']), (b'null', 'application/json'))

    def test_none_for_another_body(self) -> None:
        with fake_transport(json_response(None)) as sent:
            with self.assertRaises(ValueError):
                client.make_api_request(url=f'{FAKE_ROOT}/x', http_method='POST', body=None, validation={'body': {'type': 'object'}})
            for schema in ({'type': 'object'}, {**NULLABLE_BODY, 'x-contentType': ['application/x-www-form-urlencoded']}):
                client.make_api_request(
                    url=f'{FAKE_ROOT}/x', http_method='POST', body=None, validation={'body': schema}, disable_client_validation=True
                )
        self.assertEqual([(s.request.body, s.request.headers.get('Content-Type')) for s in sent], [(None, None), (None, None)])


class TestEmptyForm(unittest.TestCase):
    # as the TypeScript client sends an empty FormData or URLSearchParams: an empty form, not no body
    def test_empty_multipart_form(self) -> None:
        self.assertEqual(ClientSweepRPC.post_form_entries(body={}), [])
        self.assertEqual(ClientSweepRPC.post_form_entries(body={'a': None}), [])

    def test_empty_urlencoded_form(self) -> None:
        with fake_transport(json_response({})) as sent:
            ClientSweepRPC.post_url_encoded(body={}, disable_client_validation=True)  # type: ignore[typeddict-item]
        self.assertEqual(sent[0].request.headers['Content-Type'], 'application/x-www-form-urlencoded')
        self.assertEqual(form_fields(sent[0].request), [])
        # the server reads an empty form, so its fields fail, not the body
        with self.assertRaises(HttpException) as context:
            ClientSweepRPC.post_url_encoded(body={}, disable_client_validation=True)  # type: ignore[typeddict-item]
        self.assertIn('at hello', context.exception.message)


class SignedURL(AuthBase):
    def __call__(self, request: requests.PreparedRequest) -> requests.PreparedRequest:
        request.prepare_url(request.url, {'sig': 's'})
        return request


class TestMixinQueryAndSession(unittest.TestCase):
    # requests adds the session's params and what its auth writes into the URL after the query
    def test_mixin_query_keeps_the_session_params(self) -> None:
        client.session.params = {'api_key': 'k'}
        try:
            with fake_transport(json_response(None)) as sent:
                PetstoreAPI.get_styled(query={'pipe': ['a', 'b'], 'tags': ['x|y']})
        finally:
            client.session.params = {}
        self.assertEqual(sent[0].request.url, 'https://petstore.test/v1/styled?pipe=a|b&tags=x%7Cy&api_key=k')

    def test_mixin_query_keeps_what_the_session_auth_adds(self) -> None:
        client.session.auth = SignedURL()
        try:
            with fake_transport(json_response(None)) as sent:
                PetstoreAPI.get_styled(query={'tags': ['a']})
        finally:
            client.session.auth = None
        self.assertEqual(sent[0].request.url, 'https://petstore.test/v1/styled?tags=a&sig=s')


class TestHeaderValues(unittest.TestCase):
    # as fetch sends a value: without the spaces, tabs and line breaks around it, as a token read from a file has
    def test_header_value_with_a_line_break(self) -> None:
        data = ClientRuntimeRPC.get_request_headers(headers={'authorization': ' Bearer token\r\n'})
        self.assertEqual(data, {'cookie': None, 'authorization': 'Bearer token'})

    def test_invalid_header_value_stays_out_of_the_message(self) -> None:
        with fake_transport(json_response(None)) as sent:
            with self.assertRaises(requests.exceptions.InvalidHeader) as context:
                ClientRuntimeRPC.get_request_headers(headers={'authorization': 'Bearer\nsecret'})
        self.assertEqual(sent, [])
        self.assertIn('authorization', str(context.exception))
        self.assertNotIn('secret', str(context.exception))

    def test_none_leaves_a_header_out(self) -> None:
        with fake_transport(json_response(None)) as sent:
            ClientRuntimeRPC.get_request_headers(headers={'authorization': None})  # type: ignore[dict-item]
        self.assertNotIn('authorization', sent[0].request.headers)


class TestBinaryContentType(unittest.TestCase):
    # as the TypeScript client sends untyped bytes: a concrete declared type, then a wildcard other than */*, then
    # application/octet-stream where the procedure takes it, else the JSON or URL-encoded type it declares
    def test_bytes_to_a_procedure_that_takes_any_type(self) -> None:
        self.assertEqual(WithValidationRPC.handle_wildcard_content_type(body=b'abc'), {'size': 3, 'type': 'application/octet-stream'})

    def test_bytes_to_a_procedure_that_takes_json_or_a_form(self) -> None:
        body = b'{"n":1,"tags":["a"],"nested":{"a":true}}'
        data = ClientSweepRPC.post_json_or_form(body=body)  # type: ignore[arg-type]
        self.assertEqual(data, {'body': {'n': 1, 'tags': ['a'], 'nested': {'a': True}}, 'contentType': 'application/json'})


if __name__ == "__main__":
    unittest.main()
