import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Duplicated parameter', () => {
  it('Should throw error', async () => {
    const response = await request.get(`/duplicated-parameter/123/foo/456`);

    expect(response.status).toBe(500);
  });
});
