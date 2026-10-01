import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import NPMCliPackageJson from '@npmcli/package-json';
import { getDevScript, updateNPMScripts } from '../../../dist/init/update-npm-scripts.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_update_npm_scripts');

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

// only the fields getDevScript reads
const withDevScript = (dev: string) =>
  ({ content: { name: 'app', scripts: { dev } } }) as unknown as Parameters<typeof getDevScript>[0];

const updateScripts = async (scripts: Record<string, string>) => {
  await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0', scripts } });
  await updateNPMScripts({
    pkgJson: await NPMCliPackageJson.load(projectDir),
    root: projectDir,
    bundle: true,
    updateScriptsMode: 'implicit',
  });
  return JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')).scripts;
};

await describe('getDevScript', async () => {
  await it('Keeps the next dev flags in the implicit script', () => {
    assert.strictEqual(getDevScript(withDevScript('next dev -p 4000'), 'implicit'), 'vovk dev --next-dev -- -p 4000');
  });

  await it('Writes an explicit script that cmd.exe runs too', () => {
    // cmd.exe has no VAR=value prefix and no single quotes
    assert.strictEqual(
      getDevScript(withDevScript('next dev'), 'explicit'),
      'cross-env PORT=3000 concurrently "next dev" "vovk dev" --kill-others'
    );
    assert.strictEqual(
      getDevScript(withDevScript('next dev --hostname "0.0.0.0"'), 'explicit'),
      'cross-env PORT=3000 concurrently "next dev --hostname \\"0.0.0.0\\"" "vovk dev" --kill-others'
    );
  });

  await it('Sets PORT to the port next dev listens on in the explicit script', () => {
    assert.match(getDevScript(withDevScript('next dev -p 4000'), 'explicit'), /PORT=4000 /);
    assert.match(getDevScript(withDevScript('next dev --turbopack'), 'explicit'), /PORT=3000 /);
  });
});

await describe('updateNPMScripts', async () => {
  await it('Chains vovk onto an existing prebuild and bundle script', async () => {
    const scripts = await updateScripts({ build: 'next build', prebuild: 'prisma generate', bundle: 'tsup' });

    assert.strictEqual(scripts.prebuild, 'prisma generate && vovk generate');
    assert.strictEqual(scripts.bundle, 'tsup && vovk bundle');
    assert.strictEqual(scripts.build, 'next build');
  });

  await it('Adds the scripts once', async () => {
    const scripts = await updateScripts({ prebuild: 'prisma generate && vovk generate', bundle: 'vovk bundle' });

    assert.strictEqual(scripts.prebuild, 'prisma generate && vovk generate');
    assert.strictEqual(scripts.bundle, 'vovk bundle');
    assert.deepStrictEqual(await updateScripts({}), {
      dev: 'vovk dev --next-dev',
      prebuild: 'vovk generate',
      bundle: 'vovk bundle',
    });
  });
});
