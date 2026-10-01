import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { getConfigAbsolutePaths } from '../../../dist/get-project-info/get-config/get-config-absolute-paths.mjs';

const tmpDir = path.join(process.cwd(), 'tmp_config_paths');

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

await describe('getConfigAbsolutePaths', async () => {
  await it('Lists the config files in the order the docs give', async () => {
    const lookupOrder = [
      '.config/vovk.config.cjs',
      'vovk.config.cjs',
      '.config/vovk.config.mjs',
      'vovk.config.mjs',
      '.config/vovk.config.js',
      'vovk.config.js',
    ];
    await fs.mkdir(path.join(tmpDir, '.config'), { recursive: true });
    // created in reverse so the result order can't come from the file system
    for (const file of [...lookupOrder, 'vovk.config.ts'].reverse()) {
      await fs.writeFile(path.join(tmpDir, file), '');
    }

    assert.deepStrictEqual(
      await getConfigAbsolutePaths({ cwd: tmpDir }),
      lookupOrder.map((file) => path.join(tmpDir, file))
    );
  });
});
