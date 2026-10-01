import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkStrictConfig } from 'vovk/internal';
import { getMetaSchema } from '../../../dist/get-project-info/get-meta-schema.mjs';

const config = (extra: Partial<VovkStrictConfig>) =>
  ({ $schema: 'https://vovk.dev/api/schema/v3/config.json', rootEntry: 'rpc', libs: {}, ...extra }) as VovkStrictConfig;

await describe('getMetaSchema', async () => {
  await it('Keeps rootEntry, which every client reads to build a URL, when exposeConfigKeys leaves it out', () => {
    assert.deepStrictEqual(getMetaSchema({ config: config({ exposeConfigKeys: ['libs'] }) }).config, {
      $schema: 'https://vovk.dev/api/schema/v3/config.json',
      rootEntry: 'rpc',
      libs: {},
    });
    assert.strictEqual(getMetaSchema({ config: config({ exposeConfigKeys: [] }) }).config.rootEntry, 'rpc');
  });

  await it('Exposes only the keys exposeConfigKeys lists besides', () => {
    const { config: exposed } = getMetaSchema({
      config: config({ exposeConfigKeys: ['libs'], modulesDir: './src/modules' }),
    });
    assert.strictEqual('modulesDir' in exposed, false);
  });
});
