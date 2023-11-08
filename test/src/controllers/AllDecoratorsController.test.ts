import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';
import AllDecoratorsController from './AllDecoratorsController';
import { TargetController } from '../../../src/types';

describe('All decorators', () => {
  const names = ['get', 'post', 'put', 'patch', 'del', 'head', 'options'] as const;

  for (const name of names) {
    it(`Should handle ${name} requests and assign metadata`, async () => {
      const response = await request[name](`/all-decorators`);

      expect(response.status).toBe(200);
      expect((AllDecoratorsController as unknown as TargetController)._metadata).toHaveProperty(`${name}Method`);
    });
  }
});
