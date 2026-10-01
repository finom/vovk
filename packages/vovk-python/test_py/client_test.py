import json
import unittest
from io import BytesIO
from typing import Any, Dict
from generated_python_client.src.test_generated_python_client import (
    ClientSweepRPC,
    HttpException,
    PetstoreAPI,
    WithValidationRPC,
)
from utils import fake_transport, form_fields, json_response

FAKE_ROOT = 'http://fake.test/api'

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


if __name__ == "__main__":
    unittest.main()
