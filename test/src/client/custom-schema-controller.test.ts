import { it, describe } from 'node:test';
import { strictEqual } from 'node:assert';
import { schema } from 'vovk-client';

describe('Custom schema', () => {
  it('Should write custom schema', () => {
    strictEqual(
      schema.segments['foo/client'].controllers.CustomSchemaControllerRPC.handlers.getWithCustomSchema.misc?.hello,
      'world'
    );
  });
});
