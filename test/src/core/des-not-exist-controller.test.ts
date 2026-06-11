import { it, describe } from 'node:test';
import { strictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('Route does not exist', () => {
  it('Should throw error when route path does not exists', async () => {
    const response = await request.get(`/definitely-does-not-exist`);

    strictEqual(response.status, 404);
  });

  it('Should throw error when route exists but method is not supported', async () => {
    const getResponse = await request.get(`/post-does-not-exist/hello`);
    strictEqual(getResponse.status, 200);

    const response = await request.post(`/post-does-not-exist/hello`);
    strictEqual(response.status, 404);
  });
});
