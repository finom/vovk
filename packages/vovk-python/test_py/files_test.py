import inspect
import unittest
from io import BytesIO
from generated_python_client.src.test_generated_python_client import PetstoreAPI, client
from utils import fake_transport, form_fields, json_response


class TestFilesAlone(unittest.TestCase):
    # a multipart body of files alone: the method takes no body, and the files go out as a form
    def test_method_without_a_body(self) -> None:
        self.assertNotIn('body', inspect.signature(PetstoreAPI.upload_pet_photo).parameters)
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.upload_pet_photo(params={'petId': '1'}, files={'pet-photo': ('rex.png', BytesIO(b'png'), 'image/png')})
        self.assertEqual(sent[0].request.url, 'https://petstore.test/v1/pets/1/photo')
        self.assertEqual(form_fields(sent[0].request), [('pet-photo', 'file:rex.png')])

    # the same call, made without a body, to a procedure that reads the form
    def test_server_reads_the_files(self) -> None:
        data = client.request(
            segment_name='client-sweep',
            rpc_name='ClientSweepRPC',
            handler_name='postJsonOrForm',
            api_root=None,
            files={'file': ('a.txt', BytesIO(b'x'))},
        )
        self.assertEqual(data, {'body': {'file': 'file:a.txt'}, 'contentType': 'multipart/form-data'})


if __name__ == "__main__":
    unittest.main()
