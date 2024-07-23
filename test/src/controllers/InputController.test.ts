import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Input controller', () => {
  it('Should handle parameters, query and body', async () => {
    const body = { hello: 'world' };
    const a = 'param-a';
    const b = 'param-b';
    const c = 'param-c';
    const q1 = 'query-1';
    const q2 = 'query-2';
    const response = await request.post(`/input/foo/${a}/${b}/bar/${c}?q1=${q1}&q2=${q2}`).send(body);

    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ a, b, c, q1, q2, body });
  });
});
