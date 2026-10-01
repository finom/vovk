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

  await it('Replaces a corrupt schema file and reports every controller as added', async () => {
    await fs.writeFile(path.join(schemaOut, 'root.json'), '{"controllers": {');
    const segmentSchema = {
      ...makeSchema(''),
      controllers: { UserRPC: { rpcModuleName: 'UserRPC', handlers: {} } },
    };

    const { diffResult } = await writeOneSegmentSchemaFile({
      schemaOutAbsolutePath: schemaOut,
      segmentSchema,
      skipIfExists: false,
    });

    assert.deepStrictEqual(JSON.parse(await fs.readFile(path.join(schemaOut, 'root.json'), 'utf-8')), segmentSchema);
    assert.deepStrictEqual(diffResult?.controllers.added, ['UserRPC']);
  });

  await it('Refuses a segment named like the root segment file', async () => {
    const rootSchema = { ...makeSchema(''), controllers: { UserRPC: { rpcModuleName: 'UserRPC', handlers: {} } } };
    await fs.writeFile(path.join(schemaOut, 'root.json'), JSON.stringify(rootSchema));

    for (const segmentName of ['root', 'Root']) {
      await assert.rejects(
        writeOneSegmentSchemaFile({
          schemaOutAbsolutePath: schemaOut,
          segmentSchema: makeSchema(segmentName),
          skipIfExists: false,
        }),
        new RegExp(`A segment can't be named "${segmentName}"`)
      );
    }

    assert.deepStrictEqual(JSON.parse(await fs.readFile(path.join(schemaOut, 'root.json'), 'utf-8')), rootSchema);
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
