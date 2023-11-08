import { it, expect, describe } from '@jest/globals';
import MiscController from './MiscController';
import { TargetController } from '../../../src/types';
import { activateControllers } from '../../../src';

describe('Hidden features', () => {
  it(`Metadata`, () => {
    expect((MiscController as unknown as TargetController)._metadata).toHaveProperty(`getMethod`);

    activateControllers(MiscController);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(activateControllers._getControllerByStaticMethod(MiscController.getMethod)).toEqual(MiscController);
  });
});
