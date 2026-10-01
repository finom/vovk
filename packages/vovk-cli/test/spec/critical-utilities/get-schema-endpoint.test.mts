import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getSchemaEndpoint } from '../../../dist/dev/index.mjs';

await describe('getSchemaEndpoint', async () => {
  await it('Requests the root and nested segments from the local dev server', () => {
    assert.strictEqual(
      getSchemaEndpoint({ port: '4778', rootEntry: 'api', devHttps: false, segmentName: '' }),
      'http://localhost:4778/api/_schema_'
    );
    assert.strictEqual(
      getSchemaEndpoint({ port: '4778', rootEntry: 'api', devHttps: true, segmentName: 'foo/bar' }),
      'https://localhost:4778/api/foo/bar/_schema_'
    );
  });

  await it('Takes no origin, so a production origin never becomes the schema host', () => {
    // the arguments are all there is: config.outputConfig.origin cannot reach the endpoint
    const endpoint = getSchemaEndpoint({ port: '3000', rootEntry: 'v1', devHttps: false, segmentName: 'admin' });
    assert.strictEqual(new URL(endpoint).host, 'localhost:3000');
    assert.strictEqual(endpoint, 'http://localhost:3000/v1/admin/_schema_');
  });
});
