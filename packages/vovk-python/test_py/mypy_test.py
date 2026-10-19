import glob
import json
import os
import subprocess
import sys
import tempfile
import unittest
from importlib.util import find_spec
from io import BytesIO
from typing import List
from generated_python_client.src.test_generated_python_client import ClientSweepRPC, PetstoreAPI, WithValidationRPC
from utils import fake_transport, form_fields, json_response

TEST_DIR = os.path.dirname(os.path.abspath(__file__))
PACKAGE_DIR = os.path.join(TEST_DIR, 'generated_python_client')
SOURCES = os.path.join('src', 'test_generated_python_client')
HAS_MYPY = find_spec('mypy') is not None


# CI installs requirements-ci.txt, so there a missing mypy fails instead of skipping
@unittest.skipIf(not HAS_MYPY and not os.environ.get('CI'), 'mypy not found: npm run install:py')
class TestMypy(unittest.TestCase):
    def assert_mypy_passes(self, cwd: str, *args: str) -> None:
        with tempfile.TemporaryDirectory() as cache_dir:
            result = subprocess.run(
                [sys.executable, '-m', 'mypy', '--cache-dir', cache_dir, *args], cwd=cwd, capture_output=True, text=True
            )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    # the README's "Checked with mypy": the config the package ships
    def test_package_with_its_own_config(self) -> None:
        self.assert_mypy_passes(PACKAGE_DIR, '--config-file', 'pyproject.toml', SOURCES)

    # pySrc puts the sources into another project, where that project's mypy config checks them
    def test_package_with_a_stricter_config(self) -> None:
        # --strict leaves out --warn-unreachable; without warn_return_any, an ignore only it needs is unused
        for flags in (['--strict', '--warn-unreachable'], ['--warn-unused-ignores']):
            with self.subTest(flags=flags):
                self.assert_mypy_passes(PACKAGE_DIR, '--config-file', os.devnull, *flags, SOURCES)

    # every call the tests make, with the literals and annotations a user writes
    def test_calls_in_the_tests(self) -> None:
        modules = sorted(os.path.basename(path) for path in glob.glob(os.path.join(TEST_DIR, '*.py')))
        self.assert_mypy_passes(TEST_DIR, '--config-file', os.path.join(PACKAGE_DIR, 'pyproject.toml'), *modules)


class TestDocumentedNames(unittest.TestCase):
    # the names the docs annotate with, checked by mypy above: a TypedDict, an alias of one, an alias of str, the files
    def test_values_annotated_with_the_generated_names(self) -> None:
        body: WithValidationRPC.HandleAllBody = {'hello': 'world'}
        query: WithValidationRPC.HandleAllQuery = {'search': 'value'}
        params: WithValidationRPC.HandleAllParams = {'foo': 'foo', 'bar': 'bar'}
        text: ClientSweepRPC.PostJsonStringBody = 'text'
        files: WithValidationRPC.HandleMultipartDataWithMultipleFilesFiles = [
            ('files', ('a.txt', BytesIO(b'a'), 'text/plain'))
        ]
        with fake_transport(json_response({'body': body, 'query': query, 'params': params, 'vovkParams': params})):
            output: WithValidationRPC.HandleAllOutput = WithValidationRPC.handle_all(body=body, query=query, params=params)
        with fake_transport(json_response({'name': 'Rex'})):
            pet: PetstoreAPI.GetPetOutput = PetstoreAPI.get_pet(params={'petId': '1'})
        with fake_transport(json_response(None)) as sent:
            ClientSweepRPC.post_json_string(body=text)
            WithValidationRPC.handle_multipart_data_with_multiple_files(body={'hello': 'world'}, query=query, files=files)
        names: List[str] = [output['body']['hello'], pet['name']]
        self.assertEqual(names, ['world', 'Rex'])
        self.assertEqual(sent[0].request.body, b'"text"')
        self.assertEqual(form_fields(sent[1].request), [('hello', 'world'), ('files', 'file:a.txt')])

    # an OpenAPI object that may be null, with a free-form object and a property only requests carry
    def test_mixin_body_and_output_that_may_be_null(self) -> None:
        body: PetstoreAPI.UpdatePetProfileBody = {'name': 'Rex', 'extra': {'tags': ['a']}, 'password': 'secret'}
        with fake_transport(json_response({'name': 'Rex'})) as sent:
            profile: PetstoreAPI.UpdatePetProfileOutput = PetstoreAPI.update_pet_profile(body=body, params={'petId': '1'})
            PetstoreAPI.update_pet_profile(body=None, params={'petId': '1'})
        self.assertEqual(profile, {'name': 'Rex'})
        self.assertEqual([json.loads(request.request.body or b'') for request in sent], [body, None])


if __name__ == "__main__":
    unittest.main()
