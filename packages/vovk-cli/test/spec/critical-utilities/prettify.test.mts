import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

await describe('warnIfPrettierMissing', async () => {
  await it('Warns once when the files of one generation check at the same time', async () => {
    const cwd = process.cwd();
    // prettier resolves from the project, and this one has none
    const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'vovk-without-prettier-'));
    process.chdir(projectDir);
    try {
      const { warnIfPrettierMissing } = await import('../../../dist/utils/prettify.mjs');
      const warnings: string[] = [];
      const log = { warn: (message: string) => warnings.push(message) } as unknown as Parameters<
        typeof warnIfPrettierMissing
      >[0];

      await Promise.all([warnIfPrettierMissing(log), warnIfPrettierMissing(log), warnIfPrettierMissing(log)]);

      assert.strictEqual(warnings.length, 1);
    } finally {
      process.chdir(cwd);
      await fs.rm(projectDir, { recursive: true, force: true });
    }
  });
});
