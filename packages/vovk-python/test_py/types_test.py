import collections.abc
import configparser
import inspect
import json
import os
import re
import subprocess
import sys
import typing
import unittest
from typing import BinaryIO, Dict, List, Union
import generated_python_client.src.test_generated_python_client as package
from generated_python_client.src.test_generated_python_client import ClientSweepRPC, PetstoreAPI, WithValidationRPC
from utils import fake_transport, json_response

if sys.version_info >= (3, 11):
    from typing import NotRequired
else:
    from typing_extensions import NotRequired

PACKAGE_DIR = os.path.join(os.path.dirname(__file__), 'generated_python_client')
# the client's own imports with typing_extensions gone, after its dependencies took what they import of it
WITHOUT_TYPING_EXTENSIONS = '''
import sys, jsonschema, jsonschema.exceptions, requests, urllib3.filepost
sys.modules['typing_extensions'] = None
import generated_python_client.src.test_generated_python_client
'''


class TestTypes(unittest.TestCase):
    def test_recursive_body(self) -> None:
        body: PetstoreAPI.CreateDocumentBody = {
            'data': {'list': [1, 'x', None, True]},
            'tree': {'children': [{'children': []}]},
        }
        with fake_transport(json_response(None)) as sent:
            PetstoreAPI.create_document(body=body)
        self.assertEqual(json.loads(sent[0].request.body or ''), body)

    def test_every_annotation_resolves(self) -> None:
        problems: List[str] = []
        rpc_modules = [value for value in vars(package).values() if isinstance(value, type) and value.__module__ == package.__name__]
        for rpc in rpc_modules:
            for name, value in vars(rpc).items():
                target = value.__func__ if isinstance(value, staticmethod) else value
                # an alias such as Dict[str, Any] is evaluated on import, and get_type_hints refuses it before Python 3.14
                if name.startswith('__') or not (isinstance(target, type) or inspect.isroutine(target)):
                    continue
                try:
                    typing.get_type_hints(target, localns=dict(vars(rpc)))
                except Exception as error:  # noqa: BLE001
                    problems.append(f'{rpc.__name__}.{name}: {type(error).__name__}: {error}')
        self.assertEqual(problems, [])

    def test_body_of_keys_by_pattern(self) -> None:
        # the keys aren't listed, so a TypedDict would refuse each of them
        self.assertEqual(PetstoreAPI.CreateTagsBody, Dict[str, str])

    def test_text_body_takes_a_str(self) -> None:
        # the server reads JSON Lines and XML as text
        for method in (ClientSweepRPC.post_lines, ClientSweepRPC.post_xml):
            with self.subTest(method.__name__):
                hints = typing.get_type_hints(method, localns=dict(vars(ClientSweepRPC)))
                self.assertEqual(hints['body'], Union[str, bytes])

    def test_files_take_a_bare_file(self) -> None:
        # a (field name, file) pair holds a file or a tuple, as requests takes it
        hints = typing.get_type_hints(
            WithValidationRPC.handle_multipart_data_with_multiple_files, localns=dict(vars(WithValidationRPC))
        )
        pairs = [arg for arg in typing.get_args(hints['files']) if typing.get_origin(arg) is collections.abc.Sequence]
        self.assertEqual(len(pairs), 1, hints['files'])
        _, file_value = typing.get_args(typing.get_args(pairs[0])[0])
        self.assertIn(BinaryIO, typing.get_args(file_value))

    def test_optional_key(self) -> None:
        hints = typing.get_type_hints(ClientSweepRPC.GetEchoQuery, include_extras=True)
        self.assertIs(hints['q'], str)
        self.assertIs(typing.get_origin(hints['page']), NotRequired)

    # the package's dependencies take typing_extensions only before Python 3.12; mypy brings it in here
    @unittest.skipIf(sys.version_info < (3, 12), 'the client imports typing_extensions before Python 3.12')
    def test_no_typing_extensions_from_python_3_12(self) -> None:
        result = subprocess.run(
            [sys.executable, '-c', WITHOUT_TYPING_EXTENSIONS], cwd=os.path.dirname(__file__), capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_package_metadata(self) -> None:
        # a version check mypy reads, so it doesn't look for tomllib on older Pythons
        if sys.version_info < (3, 11):
            self.skipTest('tomllib is in Python 3.11 and later')
        else:
            import tomllib
            with open(os.path.join(PACKAGE_DIR, 'pyproject.toml'), 'rb') as file:
                pyproject = tomllib.load(file)
            names = [re.split(r'[^A-Za-z0-9_.-]', dependency)[0] for dependency in pyproject['project']['dependencies']]
            # requests picks a urllib3 itself, and rfc3987 is GPL-3.0
            self.assertNotIn('urllib3', names)
            self.assertNotIn('rfc3987', names)
            # the client's annotations need Python 3.9; mypy checks for the Python it runs on, as mypy 2.4 refuses 3.9
            self.assertEqual(pyproject['project']['requires-python'], '>=3.9')
            self.assertNotIn('python_version', pyproject['tool']['mypy'])
            setup = configparser.ConfigParser()
            setup.read(os.path.join(PACKAGE_DIR, 'setup.cfg'))
            self.assertNotIn('python_version', setup['mypy'])


if __name__ == "__main__":
    unittest.main()
