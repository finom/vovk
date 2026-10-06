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

  await it('Names the Node.js versions it needs on an older Node.js', async () => {
    const packageJsonPath = path.join(cliPath, '../../package.json');
    const { bin } = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    // on a real Node.js 20 or 18 a dependency throws at import (undici, @inquirer); this one only reports 20.18.2
    const olderNode = `data:text/javascript,${encodeURIComponent(
      "Object.defineProperty(process.versions, 'node', { value: '20.18.2' }); Object.defineProperty(process, 'version', { value: 'v20.18.2' });"
    )}`;
    const args = ['--import', olderNode, path.join(packageJsonPath, '..', bin.vovk), '--version'];
    const { exitCode, output } = await promisify(execFile)(process.execPath, args).then(
      ({ stdout, stderr }) => ({ exitCode: 0, output: stdout + stderr }),
      (error: { code: number; stdout: string; stderr: string }) => ({
        exitCode: error.code,
        output: error.stdout + error.stderr,
      })
    );

    assert.notStrictEqual(exitCode, 0, output);
    // any uncaught exception ends with Node.js's own "Node.js v24.1.0" line, which names no requirement
    assert.match(output.replace(/^Node\.js v[\d.]+$/m, ''), /Node\.js/, output);
  });
});
