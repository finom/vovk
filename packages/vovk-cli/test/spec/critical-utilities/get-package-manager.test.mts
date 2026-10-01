import assert from 'node:assert';
import { describe, it } from 'node:test';
import { getPackageManager } from '../../../dist/init/install-dependencies.mjs';

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
});
