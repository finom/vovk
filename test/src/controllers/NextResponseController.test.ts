import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('NextResponse', () => {
  it('Should handle NextResponse', async () => {
    const response = await request.get(`/next-response`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: 'world' });
  });

  it('Should handle Response object', async () => {
    const response = await request.get(`/next-response/response-object`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: 'world2' });
  });
});
