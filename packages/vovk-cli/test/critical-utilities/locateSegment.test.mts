import assert from 'node:assert';
import { it, describe } from 'node:test';
import locateSegments from '../../src/locateSegments.mjs';
import path from 'node:path';

const __dirname = import.meta.dirname;

void describe('#locateSegment', async () => {
  await it('Locates segments properly', async () => {
    const rootDirectory = path.join(__dirname, '../test_data/segments');
    const results = await locateSegments(rootDirectory);

    const expectedResults = [
      {
        routeFilePath: path.join(__dirname, '../test_data/segments/[[...vovk]]/route.ts'),
        segmentName: '',
      },
      {
        routeFilePath: path.join(__dirname, '../test_data/segments/bar/[[...custom]]/route.ts'),
        segmentName: 'bar',
      },
      {
        routeFilePath: path.join(__dirname, '../test_data/segments/foo/[[...vovk]]/route.ts'),
        segmentName: 'foo',
      },
      {
        routeFilePath: path.join(__dirname, '../test_data/segments/quux/corge/[[...vovk]]/route.ts'),
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
