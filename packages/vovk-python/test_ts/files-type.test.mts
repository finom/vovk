import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import type { VovkJSONSchemaBase } from 'vovk';
import { convertJSONSchemaToPythonFilesType } from '../index.js';

const file = { type: 'string', format: 'binary' } as const;
const FILE_VALUE =
  'Union[BinaryIO, Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';
const filesType = (schema: VovkJSONSchemaBase) =>
  convertJSONSchemaToPythonFilesType({ schema, namespace: 'Rpc', className: 'Files', pad: 0 });

test('a file field whose name is not a Python name is a key of a functional TypedDict', () => {
  assert.equal(
    filesType({ type: 'object', properties: { 'my-file': file }, required: ['my-file'] }),
    `Files = TypedDict("Files", {"my-file": "${FILE_VALUE}"})`
  );
});

test("the body's title and description document its files", () => {
  const one = filesType({
    type: 'object',
    title: 'Upload',
    description: 'A file',
    properties: { file },
    required: ['file'],
  });
  assert.match(
    one,
    /^class Files\(TypedDict\):\n {4}"""\n {4}Upload - File Upload\n\s*\n {4}A file\n {4}"""\n {4}file: Union\[/
  );

  const several = filesType({ type: 'object', title: 'Upload', properties: { files: { type: 'array', items: file } } });
  assert.match(several, /\n"""\nUpload - File Uploads\n"""\nFiles = List\[Tuple\[str, Union\[Tuple\[str, BinaryIO\], /);
});
