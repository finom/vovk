import json
import unittest
from generated_python_client.src.test_generated_python_client import PetstoreAPI
from utils import fake_transport, json_response


class TestTypes(unittest.TestCase):
    def test_recursive_body(self) -> None:
        body: PetstoreAPI.CreateDocumentBody = {
            'data': {'list': [1, 'x', None, True]},
            'tree': {'children': [{'children': []}]},
        }
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.create_document(body=body)
        self.assertEqual(json.loads(sent[0].request.body or ''), body)


if __name__ == "__main__":
    unittest.main()
