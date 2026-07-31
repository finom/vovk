import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { writeOneSegmentSchemaFile } from '../../../dist/dev/write-one-segment-schema-file.mjs';

const root = path.join(process.cwd(), 'tmp_write_one_segment');
const schemaOut = path.join(root, '.vovk-schema');

const makeSchema = (segmentName: string) => ({
  $schema: 'https://vovk.dev/api/schema/v3/segment.json' as const,
  emitSchema: true,
  segmentName,
  segmentType: 'segment' as const,
  controllers: {},
});

beforeEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(schemaOut, { recursive: true });
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

await describe('writeOneSegmentSchemaFile', async () => {
  await it('Writes a nested segment inside the schema out dir', async () => {
    await writeOneSegmentSchemaFile({
      schemaOutAbsolutePath: schemaOut,
      segmentSchema: makeSchema('folder/segment'),
      skipIfExists: false,
    });

    const written = await fs.readFile(path.join(schemaOut, 'folder/segment.json'), 'utf-8');
    assert.strictEqual(JSON.parse(written).segmentName, 'folder/segment');
  });

  await it('Refuses a segment name that escapes the schema out dir', async () => {
    await fs.writeFile(path.join(root, 'package.json'), '{"name":"victim"}');

    await assert.rejects(
      writeOneSegmentSchemaFile({
        schemaOutAbsolutePath: schemaOut,
        segmentSchema: makeSchema('../package'),
        skipIfExists: false,
      }),
      /Refusing to write schema outside/
    );

    // the file outside the out dir is untouched
    assert.strictEqual(JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf-8')).name, 'victim');
  });
});
