import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { request } from '../lib.ts';

describe('Conflicting routes', () => {
  it('Should throw error on parameterized route conflict', async () => {
    const response = await request.get(`/conflicting-routes/hello/123`);

    strictEqual(response.status, 500);
  });
});
