import { it, describe } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('All decorators', () => {
  const names = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests`, async () => {
      const response = await request[name](`/all-decorators`);

      strictEqual(response.status, 200);
    });
  }

  it('Should handle decorator header', async () => {
    const response = await request.get(`/all-decorators/get-with-header`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['x-decorator-header'], 'hello');
  });

  it('Should handle CORS', async () => {
    const response = await request.get(`/all-decorators/get-with-cors`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['access-control-allow-origin'], '*');
  });

  it('Should handle before', async () => {
    const response = await request.get(`/all-decorators/get-with-before`);

    strictEqual(response.status, 200);
    deepStrictEqual(response.body, { before: true });
  });

  it('Should handle head headers', async () => {
    const response = await request.head(`/all-decorators`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['x-head-header'], 'head');
  });

  it('Should handle options headers', async () => {
    const response = await request.options(`/all-decorators`);

    strictEqual(response.status, 200);
    strictEqual(response.headers['x-options-header'], 'options');
  });
});
