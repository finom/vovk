import { request } from '../lib';
import { it, xit, expect, describe } from '@jest/globals';

describe('Auto decorators', () => {
  const names = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests`, async () => {
      const response = await request[name](`/auto-decorators/${name}-method`);

      expect(response.status).toBe(200);
    });
  }

  xit('Should handle decorator header', async () => {});
});
