import { request } from '../../../lib';
import { it, expect, describe } from '@jest/globals';

describe('Built-in router', () => {
  it('should not conflict with other routes', async () => {
    const response = await request.get('/standard');
    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: 'world' });
  });
});
