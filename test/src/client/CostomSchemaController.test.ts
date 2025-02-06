import { it, expect, describe } from '@jest/globals';
import segmentsSchema from '../../.vovk-schema/index.cjs';

describe('Custom schema', () => {
  it('Should write custom schema', () => {
    expect(
      segmentsSchema['foo/client'].controllers.CostomSchemaControllerRPC.handlers.getWithCustomSchema.custom?.hello
    ).toEqual('world');
  });
});
