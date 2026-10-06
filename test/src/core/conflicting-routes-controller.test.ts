import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkErrorResponse } from '../../../packages/vovk/dist/types/core.js';
import { request } from '../lib.ts';

describe('Conflicting routes', () => {
  it('Should throw error on parameterized route conflict', async () => {
    const response = await request.get(`/conflicting-routes/hello/123`);

    strictEqual(response.status, 500);
    deepStrictEqual(response.body, {
      statusCode: 500,
      message: 'Conflicting routes found: conflicting-routes/hello/{foo}, conflicting-routes/hello/{bar}',
      isError: true,
    } satisfies VovkErrorResponse);
  });
});
