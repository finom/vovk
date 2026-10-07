import assert from 'node:assert';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
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

  await describe('Without vovk installed', async () => {
    // resolves vovk as Node.js does when the package is missing
    const withoutVovk = `data:text/javascript,${encodeURIComponent(`
      import { registerHooks } from 'node:module';
      registerHooks({
        resolve(specifier, context, nextResolve) {
          if (specifier === 'vovk' || specifier.startsWith('vovk/')) {
            const error = new Error("Cannot find package 'vovk' imported from " + context.parentURL);
            throw Object.assign(error, { code: 'ERR_MODULE_NOT_FOUND' });
          }
          return nextResolve(specifier, context);
        },
      });
    `)}`;
    const run = (args: string[], cwd?: string) =>
      promisify(execFile)(process.execPath, ['--import', withoutVovk, cliPath, ...args], { cwd }).then(
        ({ stdout, stderr }) => ({ exitCode: 0, output: stdout + stderr }),
        (error: { code: number; stdout: string; stderr: string }) => ({
          exitCode: error.code,
          output: error.stdout + error.stderr,
        })
      );

    await it('Prints the help and the version', async () => {
      const help = await run(['--help']);
      assert.strictEqual(help.exitCode, 0, help.output);
      assert.match(help.output, /Usage: vovk/, help.output);

      const version = await run(['--version']);
      assert.strictEqual(version.exitCode, 0, version.output);
      assert.match(version.output, /^\d+\.\d+\.\d+/, version.output);
    });

    await it('Runs vovk init', async () => {
      const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'vovk-init-without-vovk-'));
      await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify({ name: 'app' }));
      const { exitCode, output } = await run(['init', '--yes', '--dry-run', '--log-level', 'debug'], cwd);
      await fs.rm(cwd, { recursive: true, force: true });

      assert.strictEqual(exitCode, 0, output);
      assert.match(output, /Config would be created/, output);
    });

    await it('Asks to install vovk in a command that needs it', async () => {
      for (const command of ['generate', 'bundle', 'dev', 'new']) {
        const { exitCode, output } = await run([command]);
        assert.notStrictEqual(exitCode, 0, output);
        assert.match(output, /npm install vovk/, output);
        // a short message, not a stack trace
        assert.doesNotMatch(output, /\n\s+at /, output);
      }
    });
  });
});
