import { it, describe } from 'node:test';
import { strictEqual } from 'node:assert';
import segmentsSchema from '../../.vovk-schema/main.cjs';

describe('Custom schema', () => {
  it('Should write custom schema', () => {
    strictEqual(
      segmentsSchema['foo/client'].controllers.CustomSchemaControllerRPC.handlers.getWithCustomSchema.custom?.hello,
      'world'
    );
  });
});
