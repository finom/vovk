import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { schema } from 'vovk-client';

describe('Custom schema', () => {
  it('Should write custom schema', () => {
    strictEqual(
      schema.segments['foo/client'].controllers.CustomSchemaControllerRPC.handlers.getWithCustomSchema.misc?.hello,
      'world'
    );
  });
});
