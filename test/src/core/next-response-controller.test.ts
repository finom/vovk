import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import { request } from '../lib.ts';

describe('NextResponse', () => {
  it('Should handle NextResponse', async () => {
    const response = await request.get(`/next-response`);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { hello: 'world' });
  });

  it('Should handle Response object', async () => {
    const response = await request.get(`/next-response/response-object`);

    strictEqual(response.status, 200);

    deepStrictEqual(response.body, { hello: 'world2' });
  });
});
