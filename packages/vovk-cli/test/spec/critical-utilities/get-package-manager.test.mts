import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { getInstallCommand, getPackageManager } from '../../../dist/init/install-dependencies.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const tmpDir = path.join(process.cwd(), 'tmp_get_package_manager');

after(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// only the fields getPackageManager reads
const asPkgJson = (packageManager?: string) =>
  ({ content: { name: 'test', packageManager } }) as unknown as Parameters<typeof getPackageManager>[0]['pkgJson'];

await describe('getPackageManager', async () => {
  await it('Reads a known package manager from package.json', async () => {
    assert.strictEqual(getPackageManager({ pkgJson: asPkgJson('pnpm@8.6.0') }), 'pnpm');
    assert.strictEqual(getPackageManager({ pkgJson: asPkgJson('yarn@3.6.0+sha512.abc') }), 'yarn');
    assert.strictEqual(getPackageManager({ pkgJson: asPkgJson() }), 'npm');
  });

  await it('Falls back to npm when package.json names an unknown binary', async () => {
    const warnings: string[] = [];
    const log = { warn: (message: string) => warnings.push(message) } as unknown as Parameters<
      typeof getPackageManager
    >[0]['log'];

    // this value would be spawned, a relative path must never reach spawn()
    assert.strictEqual(getPackageManager({ pkgJson: asPkgJson('./evil@1.0.0'), log }), 'npm');
    assert.strictEqual(getPackageManager({ pkgJson: asPkgJson('/usr/bin/whatever@1.0.0') }), 'npm');
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /Unknown "packageManager"/);
  });

  await it('Explicit flags win over package.json', async () => {
    assert.strictEqual(getPackageManager({ useBun: true, pkgJson: asPkgJson('./evil@1.0.0') }), 'bun');
    assert.strictEqual(getPackageManager({ useNpm: true, pkgJson: asPkgJson('pnpm@8.6.0') }), 'npm');
  });

  await it('Reads the lockfile of the project', async () => {
    await createProject(tmpDir, { 'pnpm-app/pnpm-lock.yaml': '', 'yarn-app/yarn.lock': '', 'bun-app/bun.lock': '' });

    for (const packageManager of ['pnpm', 'yarn', 'bun']) {
      const root = path.join(tmpDir, `${packageManager}-app`);
      // the lockfile wins over the package manager that runs vovk init, as with npx in a pnpm project
      assert.strictEqual(getPackageManager({ pkgJson: asPkgJson(), root, userAgent: 'npm/11.3.0' }), packageManager);
    }
    // package.json names it explicitly
    assert.strictEqual(
      getPackageManager({ pkgJson: asPkgJson('yarn@4.0.0'), root: path.join(tmpDir, 'pnpm-app') }),
      'yarn'
    );
  });

  await it('Takes the package manager that runs it when the project has no lockfile', async () => {
    await createProject(tmpDir, { 'new-app/package.json': { name: 'app' } });
    const root = path.join(tmpDir, 'new-app');

    assert.strictEqual(
      getPackageManager({ pkgJson: asPkgJson(), root, userAgent: 'pnpm/10.4.1 npm/? node/v24.1.0 darwin arm64' }),
      'pnpm'
    );
    assert.strictEqual(
      getPackageManager({ pkgJson: asPkgJson(), root, userAgent: 'evil/1.0.0 npm/? node/v24.1.0 darwin arm64' }),
      'npm'
    );
  });
});

await describe('getInstallCommand', async () => {
  await it('Runs the package manager through a shell on Windows, where it is a .cmd shim', async () => {
    assert.deepStrictEqual(getInstallCommand('npm', 'win32'), { command: 'npm install', args: [], shell: true });
    assert.deepStrictEqual(getInstallCommand('pnpm', 'win32'), { command: 'pnpm install', args: [], shell: true });
  });

  await it('Spawns the package manager directly elsewhere', async () => {
    assert.deepStrictEqual(getInstallCommand('npm', 'darwin'), { command: 'npm', args: ['install'], shell: false });
    assert.deepStrictEqual(getInstallCommand('yarn', 'linux'), { command: 'yarn', args: ['install'], shell: false });
  });
});
