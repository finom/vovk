import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Headers controller', () => {
  it('should handle custom header', async () => {
    const world = 'world-header-value';
    const response = await request.get(`/headers`).set('x-hello-header', world);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { hello: world });
  });

  it('should handle decorator header', async () => {
    const response = await request.get(`/headers/decorator-header`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['x-decorator-header'], 'hello');
  });
});
