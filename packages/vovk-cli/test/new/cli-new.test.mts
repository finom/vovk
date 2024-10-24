// 1. new segment DONE
// 2. new controller + service: null, zod, yup, dto; different segments
// 4. new controller: null, zod, yup, dto
// 3. new worker: null
// 6. new state (modify config so it has state); different segments
// 7. new state + custom controller (modify config so it has state and custom controller)
// 8. rootSegmentModulesDirName

// before each: set up next.js and vovk project

import { it, describe } from 'node:test';
import path from 'node:path';
import getCLIAssertions from '../lib/getCLIAssertions.mjs';
import assert from 'node:assert';

await describe.only('CLI New', async () => {
  const dir = 'tmp_test_dir';
  const cwd = path.resolve(import.meta.dirname, '../../..');

  const { runAtProjectDir, createNextApp, vovkInit, assertFile } = getCLIAssertions({ cwd, dir });

  await it('New root Segment', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment');
    await assertFile(
      'src/app/api/[[...vovk]]/route.ts',
      `initVovk({
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it('New root Segment passing "" string as segment name', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment ""');
    await assertFile(
      'src/app/api/[[...vovk]]/route.ts',
      `initVovk({
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it("New root Segment passing '' string as segment name", async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir("../dist/index.mjs new segment ''");
    await assertFile(
      'src/app/api/[[...vovk]]/route.ts',
      `initVovk({
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it('New simple Segment', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment foo');
    await assertFile(
      'src/app/api/foo/[[...vovk]]/route.ts',
      `initVovk({
        segmentName: 'foo',
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it('New nested Segment', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment bar/baz/qwe');
    await assertFile(
      'src/app/api/bar/baz/qwe/[[...vovk]]/route.ts',
      `initVovk({
        segmentName: 'bar/baz/qwe',
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it('Multiple new Segments', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment "" foo foo/bar/baz');
    await assertFile(
      'src/app/api/[[...vovk]]/route.ts',
      `initVovk({
          emitSchema: true,
          workers,
          controllers,
        });`
    );
    await assertFile(
      'src/app/api/foo/[[...vovk]]/route.ts',
      `initVovk({
          segmentName: 'foo',
          emitSchema: true,
          workers,
          controllers,
        });`
    );
    await assertFile(
      'src/app/api/foo/bar/baz/[[...vovk]]/route.ts',
      `initVovk({
        segmentName: 'foo/bar/baz',
        emitSchema: true,
        workers,
        controllers,
      });`
    );
  });

  await it.only('Throws if segment already exists', async () => {
    await createNextApp();
    await vovkInit('--yes');
    await runAtProjectDir('../dist/index.mjs new segment foo');
    await assert.rejects(() => runAtProjectDir('../dist/index.mjs new segment foo'));
  });
});
