import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Input controller', () => {
  it('Should handle parameters, query and body', async () => {
    const response = await request.get(`/redirect/from`).redirects(1);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { redirected: true });
  });
});
