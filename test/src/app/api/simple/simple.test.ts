import { it, expect, describe } from '@jest/globals';
import supertest from 'supertest';

const request = supertest(`http://localhost:${process.env.PORT}/api`);

describe('Built-in router', () => {
  it('should not conflict with other routes', async () => {
    const response = await request.get('/simple');
    expect(response.status).toBe(200);

    expect(response.body).toStrictEqual({ hello: 'world' });
  });
});

/**
 * + Global router
 * + Isolated router
 * + Normal route (check if broken)
 * + Path variations
 * Multiple parameters
 * Conflicting parameters
 * Conflicting routes
 * Body
 * Query
 * Simple decorator (add an extra property to req)
 */
