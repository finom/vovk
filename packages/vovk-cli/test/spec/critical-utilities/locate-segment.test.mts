import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { getLogger } from '../../../dist/utils/get-logger.mjs';
import { locateSegments } from '../../../dist/utils/locate-segments.mjs';

const tmpDir = path.join(process.cwd(), 'tmp_locate_segments');

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

await describe('locateSegment', async () => {
  await it('Rejects a segment named like the root segment files', async () => {
    for (const segmentDir of ['root', '', 'foo/root']) {
      const routeFilePath = path.join(tmpDir, segmentDir, '[[...vovk]]', 'route.ts');
      await fs.mkdir(path.dirname(routeFilePath), { recursive: true });
      await fs.writeFile(routeFilePath, '');
    }

    await assert.rejects(locateSegments({ dir: tmpDir, config: null, log: getLogger('warn') }), (error: Error) => {
      assert.match(error.message, /A segment can't be named "root"/);
      assert.ok(error.message.includes(`Rename ${path.join(tmpDir, 'root')}.`), error.message);
      return true;
    });

    await fs.rm(path.join(tmpDir, 'root'), { recursive: true });

    // root.json and Root.json are one file where the file system ignores case
    const upperCaseRouteFilePath = path.join(tmpDir, 'Root', '[[...vovk]]', 'route.ts');
    await fs.mkdir(path.dirname(upperCaseRouteFilePath), { recursive: true });
    await fs.writeFile(upperCaseRouteFilePath, '');
    await assert.rejects(
      locateSegments({ dir: tmpDir, config: null, log: getLogger('warn') }),
      /A segment can't be named "Root"/
    );

    await fs.rm(path.join(tmpDir, 'Root'), { recursive: true });
    const results = await locateSegments({ dir: tmpDir, config: null, log: getLogger('warn') });
    assert.deepStrictEqual(
      results.map(({ segmentName }) => segmentName),
      ['', 'foo/root']
    );
  });

  await it('Locates segments properly', async () => {
    const rootDirectory = path.join(import.meta.dirname, '../../data/segments');
    const results = await locateSegments({ dir: rootDirectory, config: null, log: getLogger('debug') });

    const expectedResults = [
      {
        routeFilePath: path.join(rootDirectory, '[[...vovk]]/route.ts'),
        segmentName: '',
      },
      {
        routeFilePath: path.join(rootDirectory, 'bar/[[...custom]]/route.ts'),
        segmentName: 'bar',
      },
      {
        routeFilePath: path.join(rootDirectory, '/foo/[[...vovk]]/route.ts'),
        segmentName: 'foo',
      },
      {
        routeFilePath: path.join(rootDirectory, 'quux/corge/[[...vovk]]/route.ts'),
        segmentName: 'quux/corge',
      },
    ];

    assert.strictEqual(
      results.length,
      expectedResults.length,
      'The number of located segments should match the expected count.'
    );

    for (let i = 0; i < results.length; i++) {
      assert.strictEqual(
        results[i].routeFilePath,
        expectedResults[i].routeFilePath,
        `The routeFilePath at index ${i} should match.`
      );
      assert.strictEqual(
        results[i].segmentName,
        expectedResults[i].segmentName,
        `The segmentName at index ${i} should match.`
      );
    }
  });
});
