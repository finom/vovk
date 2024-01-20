import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Headers controller', () => {
  it('should handle custom header', async () => {
    const world = 'world-header-value';
    const response = await request.get(`/headers`).set('x-hello-header', world);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: world });
  });

  it('should handle decorator header', async () => {
    const response = await request.get(`/headers/decorator-header`);

    expect(response.status).toBe(200);
    expect(response.headers['x-decorator-header']).toBe('hello');
  });
});
