import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Auto decorators', () => {
  const names = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests`, async () => {
      const response = await request[name](`/auto-decorators/auto-decorators-controller/${name}-method`);

      expect(response.status).toBe(200);
    });
  }
});
