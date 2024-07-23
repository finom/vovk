import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Input controller', () => {
  it('Should handle parameters, query and body', async () => {
    const response = await request.get(`/redirect/from`).redirects(1);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ redirected: true });
  });
});
