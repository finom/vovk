import json
import unittest
from io import BytesIO
from typing import Any, Dict, List
from unittest import mock
import requests
from generated_python_client.src.test_generated_python_client import (
    ClientSweepRPC,
    HttpException,
    PetstoreAPI,
    RustSweepRPC,
    WithValidationRPC,
    client,
)
from utils import fake_transport, form_fields, json_response

FAKE_ROOT = 'http://fake.test/api'
JSONL_HEADERS = {'Content-Type': 'application/jsonl; charset=utf-8'}

FORM_BODY: Dict[str, Any] = {'hello': 'world', 'flag': False, 'count': 5, 'tags': ['a', 'b'], 'meta': {'x': 1}, 'nick': None}
# as the TypeScript client sends it: None left out, one field per list item, booleans as JSON writes them, objects as JSON
FORM_FIELDS = [('hello', 'world'), ('flag', 'false'), ('count', '5'), ('tags', 'a'), ('tags', 'b'), ('meta', '{"x":1}')]


class TestClient(unittest.TestCase):
    def test_json_that_is_not_an_object(self) -> None:
        values: Any = [None, 42, True, False, 'this isError text', ['isError'], {'isError': False, 'data': 1}]
        for value in values:
            with fake_transport(json_response(value)):
                self.assertEqual(ClientSweepRPC.get_content_type(api_root=FAKE_ROOT), value)

    def test_success_with_an_is_error_key(self) -> None:
        value = {'isError': True, 'message': 'an item that looks like an error'}
        with fake_transport(json_response(value)):
            self.assertEqual(ClientSweepRPC.get_content_type(api_root=FAKE_ROOT), value)

    def test_json_error_without_a_message(self) -> None:
        with fake_transport(json_response({'isError': True, 'statusCode': 400}, status=400)):
            with self.assertRaises(HttpException) as context:
                ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
        self.assertEqual(context.exception.status_code, 400)
        self.assertEqual(context.exception.message, '{"isError": true, "statusCode": 400}')

    def test_json_error_with_a_detail_or_title(self) -> None:
        # FastAPI's {"detail": ...} and an RFC 9457 problem document have no message key; the body is the cause
        problem = {'type': 'https://example.com/probs/not-found', 'title': 'Not Found', 'status': 404, 'detail': 'Pet 42 does not exist'}
        errors: List[Any] = [
            ('application/json', {'detail': 'Item not found'}, 'Item not found'),
            ('application/problem+json', problem, 'Pet 42 does not exist'),
            ('application/problem+json', {'title': 'Not Found'}, 'Not Found'),
        ]
        for content_type, body, message in errors:
            with self.subTest(body=body):
                response = (404, {'Content-Type': content_type}, json.dumps(body).encode())
                with fake_transport(lambda request: response), self.assertRaises(HttpException) as context:
                    ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
                error = context.exception
                self.assertEqual((error.status_code, error.message, error.cause), (404, message, body))

    def test_text_error(self) -> None:
        with self.assertRaises(HttpException) as context:
            ClientSweepRPC.get_text_error()
        self.assertEqual(context.exception.status_code, 401)
        self.assertEqual(context.exception.message, 'Unauthorized')

    def test_html_error(self) -> None:
        with self.assertRaises(HttpException) as context:
            ClientSweepRPC.get_html_error()
        self.assertEqual(context.exception.status_code, 502)
        self.assertEqual(context.exception.message, '<html>502 Bad Gateway</html>')

    def test_empty_error(self) -> None:
        with self.assertRaises(HttpException) as context:
            ClientSweepRPC.get_empty_error()
        self.assertEqual(context.exception.status_code, 500)
        self.assertEqual(context.exception.message, 'Internal Server Error')

    def test_stream_with_a_malformed_line(self) -> None:
        body = b'{"i":1}\nnot json at all\n{"i":3}\n'
        items: List[Any] = []
        with fake_transport(lambda request: (200, JSONL_HEADERS, body)):
            with self.assertRaisesRegex(ValueError, 'not json at all'):
                for item in ClientSweepRPC.get_falsy_items(api_root=FAKE_ROOT):
                    items.append(item)
        self.assertEqual(items, [{'i': 1}])

    def test_stream_cut_inside_a_line(self) -> None:
        chunks = [b'{"i":1}\n{"i"', b':2}\n{"i":3, "tail": "cut of']
        items: List[Any] = []
        with fake_transport(lambda request: (200, JSONL_HEADERS, chunks)):
            with self.assertRaisesRegex(ValueError, 'cut of'):
                for item in ClientSweepRPC.get_falsy_items(api_root=FAKE_ROOT):
                    items.append(item)
        self.assertEqual(items, [{'i': 1}, {'i': 2}])

    def test_one_session_for_every_call(self) -> None:
        sessions: List[requests.Session] = []
        send = requests.Session.send

        def spy(session: requests.Session, request: requests.PreparedRequest, **options: Any) -> requests.Response:
            sessions.append(session)
            return send(session, request, **options)

        with mock.patch.object(requests.Session, 'send', spy), fake_transport(json_response({})):
            ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
            ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
        self.assertIs(sessions[0], sessions[1])

    def test_timeout(self) -> None:
        with fake_transport(json_response({})) as sent:
            ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
            default = client.timeout
            client.timeout = 5
            try:
                ClientSweepRPC.get_content_type(api_root=FAKE_ROOT)
            finally:
                client.timeout = default
        self.assertEqual(sent[0].options['timeout'], (10, 300))
        self.assertEqual(sent[1].options['timeout'], 5)

    def test_form_body_without_properties(self) -> None:
        self.assertEqual(ClientSweepRPC.post_form_entries(body={'hello': 'world'}), [['hello', 'world']])

    def test_form_fields(self) -> None:
        entries = ClientSweepRPC.post_form_entries(body=FORM_BODY)
        self.assertEqual([tuple(entry) for entry in entries], FORM_FIELDS)

    def test_form_fields_next_to_a_file(self) -> None:
        with fake_transport(json_response({})) as sent:
            WithValidationRPC.handle_multipart_data_with_file(
                body=FORM_BODY,  # type: ignore
                query={'search': 'value'},
                files={'file': ('a.txt', BytesIO(b'x'), 'text/plain')},
                disable_client_validation=True,
            )
        self.assertEqual(form_fields(sent[0].request), [*FORM_FIELDS, ('file', 'file:a.txt')])

    def test_url_encoded_fields(self) -> None:
        with fake_transport(json_response({})) as sent:
            ClientSweepRPC.post_url_encoded(body=FORM_BODY, disable_client_validation=True)  # type: ignore
        self.assertEqual(form_fields(sent[0].request), FORM_FIELDS)

    def test_array_body(self) -> None:
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.create_pets(body=[{'name': 'Rex'}, {'name': 'Tom'}])
        self.assertEqual(json.loads(sent[0].request.body or ''), [{'name': 'Rex'}, {'name': 'Tom'}])

    def test_body_of_two_content_types(self) -> None:
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.update_pet(body={'name': 'Rex'})
        self.assertEqual(sent[0].request.headers['Content-Type'], 'application/json')
        self.assertEqual(json.loads(sent[0].request.body or ''), {'name': 'Rex'})

    def test_form_or_json_body_without_a_file(self) -> None:
        # a form sends every value as text, so typed fields keep their types only as JSON
        body: Dict[str, Any] = {'n': 5, 'flag': True, 'tags': ['a', 'b']}
        with self.subTest('urlencoded or JSON'):
            self.assertEqual(ClientSweepRPC.post_form_or_json(body=body), {'body': body, 'contentType': 'application/json'})
        with self.subTest('multipart or JSON'):
            body = {'n': 1, 'tags': ['a'], 'nested': {'a': True}}
            self.assertEqual(ClientSweepRPC.post_json_or_form(body=body), {'body': body, 'contentType': 'application/json'})

    def test_params_without_a_schema(self) -> None:
        # the path has {id}, the procedure has no params schema
        self.assertEqual(ClientSweepRPC.get_user_posts(params={'id': '42'}), {'id': '42'})

    def test_text_body_content_type(self) -> None:
        with self.subTest('a string goes out as the text type the procedure declares'):
            data = ClientSweepRPC.post_string_json_or_text(body='héllo 日本')
            self.assertEqual(data, {'body': 'héllo 日本', 'contentType': 'text/plain'})
        with self.subTest('an object goes out as JSON, whatever text type the procedure also takes'):
            data = ClientSweepRPC.post_object_text_or_json(body={'event': 'click'})
            self.assertEqual(data, {'body': {'event': 'click'}, 'contentType': 'application/json'})

    def test_path_params_as_javascript_writes_them(self) -> None:
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.set_pet_vaccinated(params={'petId': 5.0, 'vaccinated': True})
            PetstoreAPI.set_pet_vaccinated(params={'petId': 2.5, 'vaccinated': False})
        self.assertEqual(
            [request.request.url for request in sent],
            ['https://petstore.test/v1/pets/5/vaccinated/true', 'https://petstore.test/v1/pets/2.5/vaccinated/false'],
        )

    def test_query_numbers_as_javascript_writes_them(self) -> None:
        self.assertEqual(RustSweepRPC.get_numeric_query(query={'limit': 10.0}), {'search': '?limit=10'})

    def test_json_lines_media_types(self) -> None:
        for media_type in ['application/jsonl', 'application/jsonlines', 'application/x-ndjson']:
            with self.subTest(media_type):
                with fake_transport(lambda request: (200, {'Content-Type': media_type}, b'{"n":1}\n{"n":2}\n')):
                    self.assertEqual(list(ClientSweepRPC.get_falsy_items(api_root=FAKE_ROOT)), [{'n': 1}, {'n': 2}])


if __name__ == "__main__":
    unittest.main()
