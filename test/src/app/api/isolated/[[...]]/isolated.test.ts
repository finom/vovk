import { it, expect, describe } from '@jest/globals';
import supertest from 'supertest';

const request = supertest(`http://localhost:${process.env.PORT}/api`);

describe('Isolated controller', () => {
  it('should work', async () => {
    const response = await request.get('/isolated');
    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ isolated: true });
  });
});
