import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkErrorResponse } from 'vovk/internal';
import { request } from '../lib.ts';

describe('Duplicated parameter', () => {
  it('Should throw error', async () => {
    const response = await request.get(`/duplicated-parameter/123/foo/456`);

    strictEqual(response.status, 500);
    deepStrictEqual(response.body, {
      statusCode: 500,
      message: 'Duplicate parameter "id" at duplicated-parameter/{id}/foo/{id}',
      isError: true,
    } satisfies VovkErrorResponse);
  });
});
