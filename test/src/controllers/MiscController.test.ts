import { it, expect, describe } from '@jest/globals';
import MiscController from './MiscController';
import { TargetController } from '../../../src/types';

describe('Hidden features', () => {
  it(`Metadata`, () => {
    expect((MiscController as unknown as TargetController)._metadata).toHaveProperty(`getMethod`);
  });
});
