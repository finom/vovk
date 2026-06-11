import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Custom decorator', () => {
  it('should use decorator', async () => {
    const response = await request.get(`/custom-decorator`);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { hello: 'world' });
  });
});
