import assert from 'node:assert';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { createProject } from '../../lib/minimal-project.mts';

// the bin of the vovk package, which pnpm dlx vovk and yarn dlx vovk run
const vovkBinPath = path.join(import.meta.dirname, '../../../../vovk/bin/index.mjs');
// outside the repository, where no vovk-cli resolves from a parent folder
const projectDir = path.join(os.tmpdir(), `vovk-cli-npx-${process.pid}`);

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

// a stand-in npx that prints what it was asked to run, so no registry is needed
async function runVovkBin(args: string[]) {
  const binDir = path.join(projectDir, '.bin');
  await fs.mkdir(binDir, { recursive: true });
  await fs.writeFile(path.join(binDir, 'npx'), '#!/bin/sh\necho "npx $*"\n', { mode: 0o755 });
  const { stdout } = await promisify(execFile)(process.execPath, [vovkBinPath, ...args], {
    cwd: projectDir,
    env: { ...process.env, NODE_PATH: '', PATH: `${binDir}${path.delimiter}${process.env.PATH}` },
  });
  return stdout.trim();
}

await describe('vovk-cli-npx, the bin of the vovk package', { skip: process.platform === 'win32' }, async () => {
  await it('Runs the vovk-cli of the project', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app' },
      'node_modules/vovk-cli/package.json': { name: 'vovk-cli', bin: { vovk: './cli.mjs' } },
      'node_modules/vovk-cli/cli.mjs': "console.log('local vovk-cli', process.argv.slice(2).join(' '));\n",
    });

    assert.strictEqual(await runVovkBin(['generate', '--force']), 'local vovk-cli generate --force');
  });

  await it('Runs npx vovk-cli@latest in a project without vovk-cli', async () => {
    await createProject(projectDir, { 'package.json': { name: 'app' } });

    assert.strictEqual(await runVovkBin(['generate', '--force']), 'npx vovk-cli@latest generate --force');
  });
});
