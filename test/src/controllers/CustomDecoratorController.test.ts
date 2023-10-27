import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Input controller', () => {
  it('Should handle parameters, query and body', async () => {
    const response = await request.get(`/custom-decorator`);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ helloCustomProperty: 'world' });
  });
});
