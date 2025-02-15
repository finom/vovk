import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Static JSON API', () => {
  it('Generates static API', async () => {
    const staticAPI = await request.get(`/static-api/endpoint-one`);
    const staticAPIWithCustomSlug = await request.get(`/static-api/endpoint-two`);

    deepStrictEqual(staticAPI.body, [
      { vovk: ['_schema_'] },
      { vovk: ['static-api', 'endpoint-one'] },
      { vovk: ['static-api', 'endpoint-two'] },
    ]);

    deepStrictEqual(staticAPIWithCustomSlug.body, [
      { custom: ['_schema_'] },
      { custom: ['static-api', 'endpoint-one'] },
      { custom: ['static-api', 'endpoint-two'] },
    ]);
  });
});
