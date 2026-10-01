import unittest
from typing import Any
from generated_python_client.src.test_generated_python_client import ClientSweepRPC, HttpException
from utils import fake_transport, json_response

FAKE_ROOT = 'http://fake.test/api'


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


if __name__ == "__main__":
    unittest.main()
