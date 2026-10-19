import sys
import unittest
from importlib.util import find_spec
from io import BytesIO
from typing import Any

from generated_python_client.src.test_generated_python_client import (
    ClientSweepRPC,
    CommonControllerRPC,
    StreamingControllerRPC,
    WithValidationRPC,
)


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


class TestFilesOfAFreeFormMultipartBody(unittest.TestCase):
    # a record body takes any field, files too, as a TypeScript FormData does
    def test_files_with_a_record_body(self) -> None:
        entries = ClientSweepRPC.post_form_entries(body={'a': 'b'}, files={'f': ('naïve file.txt', BytesIO(b'x'))})
        self.assertEqual(entries, [['a', 'b'], ['f', 'file:naïve file.txt']])
        entries = ClientSweepRPC.post_form_entries(body={}, files=[('f', ('one.txt', BytesIO(b'1')))])
        self.assertEqual(entries, [['f', 'file:one.txt']])


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
