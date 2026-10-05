import configparser
import inspect
import json
import os
import re
import sys
import typing
import unittest
from typing import List
import generated_python_client.src.test_generated_python_client as package
from generated_python_client.src.test_generated_python_client import ClientSweepRPC, PetstoreAPI
from utils import fake_transport, json_response

if sys.version_info >= (3, 11):
    from typing import NotRequired
else:
    from typing_extensions import NotRequired

PACKAGE_DIR = os.path.join(os.path.dirname(__file__), 'generated_python_client')


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

    def test_optional_key(self) -> None:
        hints = typing.get_type_hints(ClientSweepRPC.GetEchoQuery, include_extras=True)
        self.assertIs(hints['q'], str)
        self.assertIs(typing.get_origin(hints['page']), NotRequired)

    @unittest.skipIf(sys.version_info < (3, 11), 'tomllib is in Python 3.11 and later')
    def test_package_metadata(self) -> None:
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
