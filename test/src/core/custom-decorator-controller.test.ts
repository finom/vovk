import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { request } from '../lib.ts';

describe('Custom decorator', () => {
  it('should use decorator', async () => {
    const response = await request.get(`/custom-decorator`);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { hello: 'world' });
  });
});
