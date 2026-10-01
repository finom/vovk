import assert from 'node:assert';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { promisify } from 'node:util';

const cliPath = path.join(import.meta.dirname, '../../../dist/index.mjs');

await describe('vovk bin', async () => {
  await it('Has a shebang that env without -S runs, as on Alpine', async () => {
    const [shebang] = (await fs.readFile(cliPath, 'utf-8')).split('\n');

    // BusyBox env takes the whole line after the interpreter as one program name
    assert.strictEqual(shebang, '#!/usr/bin/env node');
  });

  await it('Runs as an executable', { skip: process.platform === 'win32' }, async () => {
    const { version } = JSON.parse(await fs.readFile(path.join(cliPath, '../../package.json'), 'utf-8'));
    const { stdout } = await promisify(execFile)(cliPath, ['--version']);

    assert.strictEqual(stdout.trim(), version);
  });
});
