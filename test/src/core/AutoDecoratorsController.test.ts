import { it, describe } from 'node:test';
import { strictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Auto decorators', () => {
  const names = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests`, async () => {
      const response = await request[name](`/auto-decorators/${name}-method`);

      strictEqual(response.status, 200);
    });
  }

  it('Should handle decorator header', async () => {
    const response = await request.get(`/auto-decorators/get-with-header`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['x-decorator-header'], 'hello');
  });
});
