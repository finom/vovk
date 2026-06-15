import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { request } from '../lib.ts';

describe('Duplicated parameter', () => {
  it('Should throw error', async () => {
    const response = await request.get(`/duplicated-parameter/123/foo/456`);

    strictEqual(response.status, 500);
  });
});
