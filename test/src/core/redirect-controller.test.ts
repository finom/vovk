import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { request } from '../lib.ts';

describe('Input controller', () => {
  it('Should handle parameters, query and body', async () => {
    const response = await request.get(`/redirect/from`).redirects(1);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { redirected: true });
  });
});
