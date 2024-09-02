import { it, expect, describe } from '@jest/globals';
import segmentsSchema from '../../.vovk-schema';

describe('Custom .vovk.json schema', () => {
  it('Should write custom schema', () => {
    expect(
      segmentsSchema['foo/client'].controllers.CostomSchemaController._handlers.getWithCustomSchema.customSchema?.hello
    ).toEqual('world');
  });
});
