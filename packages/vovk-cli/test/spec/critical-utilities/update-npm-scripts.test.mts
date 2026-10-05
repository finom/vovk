import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import NPMCliPackageJson from '@npmcli/package-json';
import { getDevScript, getDevScriptMode, updateNPMScripts } from '../../../dist/init/update-npm-scripts.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_update_npm_scripts');

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

// only the fields getDevScript reads
const withDevScript = (dev: string) =>
  ({ content: { name: 'app', scripts: { dev } } }) as unknown as Parameters<typeof getDevScript>[0];

const updateScripts = async (scripts: Record<string, string>, packageJson: Record<string, unknown> = {}) => {
  await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0', ...packageJson, scripts } });
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

  await it('Writes the explicit script for a dev script that runs more than next dev', () => {
    // the implicit script hands everything after -- to next dev, so it only fits next dev and its flags
    for (const dev of [
      'prisma generate && next dev',
      'dotenv -e .env.local -- next dev',
      'cross-env NODE_OPTIONS=--inspect next dev',
    ]) {
      assert.strictEqual(getDevScript(withDevScript(dev), 'implicit'), getDevScript(withDevScript(dev), 'explicit'));
    }
  });

  await it('Keeps the chosen mode for a dev script that already runs vovk dev', () => {
    // a second vovk init must not add concurrently and cross-env for its own implicit script
    assert.strictEqual(getDevScriptMode(withDevScript('vovk dev --next-dev'), 'implicit'), 'implicit');
    assert.strictEqual(getDevScriptMode(withDevScript('prisma generate && next dev'), 'implicit'), 'explicit');
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

  await it('Generates the client in the build script under Yarn 2+, which never runs prebuild', async () => {
    const scripts = await updateScripts({ build: 'next build' }, { packageManager: 'yarn@4.9.2' });

    assert.strictEqual(scripts.build, 'vovk generate && next build');
  });
});
