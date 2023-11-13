import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Custom decorator', () => {
  it('should use decorator', async () => {
    const response = await request.get(`/custom-decorator`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: 'world' });
  });
});
