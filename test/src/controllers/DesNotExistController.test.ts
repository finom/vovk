import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Route does not exist', () => {
  it('Should throw error when route path does not exists', async () => {
    const response = await request.get(`/definitely-does-not-exist`);

    expect(response.status).toBe(404);
  });

  it('Should throw error when route exists but method is not supported', async () => {
    const getResponse = await request.get(`/post-does-not-exist/hello`);
    expect(getResponse.status).toBe(200);

    const response = await request.post(`/post-does-not-exist/hello`);
    expect(response.status).toBe(404);
  });
});
