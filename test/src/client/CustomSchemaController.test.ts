import { it, describe } from 'node:test';
import { strictEqual } from 'node:assert';
import { fullSchema } from 'vovk-client';

describe('Custom schema', () => {
  it('Should write custom schema', () => {
    strictEqual(
      fullSchema.segments['foo/client'].controllers.CustomSchemaControllerRPC.handlers.getWithCustomSchema.custom
        ?.hello,
      'world'
    );
  });
});
