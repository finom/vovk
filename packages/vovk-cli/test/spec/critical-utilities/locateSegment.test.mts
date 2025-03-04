import assert from 'node:assert';
import { it, describe } from 'node:test';
import path from 'node:path';
import locateSegments from '../../../dist/locateSegments.mjs';

await describe('locateSegment', async () => {
  await it('Locates segments properly', async () => {
    const rootDirectory = path.join(import.meta.dirname, '../../data/segments');
    const results = await locateSegments({ dir: rootDirectory, config: null });

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
