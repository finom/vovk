import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Custom decorator', () => {
  it('should use simple decorator', async () => {
    const response = await request.get(`/custom-decorator`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ simpleDecorator: 'hello' });
  });

  it('should use nice decorator', async () => {
    const response = await request.get(`/custom-decorator/nice`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ niceDecorator: 'hello' });
  });
});
