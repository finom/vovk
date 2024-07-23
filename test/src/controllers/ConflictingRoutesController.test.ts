import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Conflicting routes', () => {
  it('Should throw error', async () => {
    const response = await request.get(`/conflicting-routes/hello/123`);

    expect(response.status).toBe(500);
  });
});
