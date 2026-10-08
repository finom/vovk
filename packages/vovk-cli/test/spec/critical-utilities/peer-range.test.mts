import assert from 'node:assert';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';

type Options = { includePrerelease?: boolean };
// semver 7 as @npmcli/package-json, a dependency of vovk-cli, resolves it
const semver = createRequire(createRequire(import.meta.url).resolve('@npmcli/package-json'))('semver') as {
  intersects: (a: string, b: string, options?: Options) => boolean;
  satisfies: (version: string, range: string, options?: Options) => boolean;
};

const packagesDir = path.join(import.meta.dirname, '../../../..');
const readManifest = async (name: string) =>
  JSON.parse(await fs.readFile(path.join(packagesDir, name, 'package.json'), 'utf-8')) as {
    version: string;
    peerDependencies?: Record<string, string>;
  };

await describe('The vovk peer range', async () => {
  const { version: monorepoVersion } = await readManifest('vovk');

  for (const name of ['vovk-cli', 'vovk-ajv', 'vovk-python', 'vovk-rust']) {
    await it(`${name} accepts vovk 4 only`, async () => {
      const range = (await readManifest(name)).peerDependencies?.vovk;
      assert.ok(range, `${name} has no vovk peer`);

      assert.ok(!semver.intersects(range, '<4.0.0-0', { includePrerelease: true }), `${range} admits vovk 3`);
      assert.ok(!semver.satisfies('3.7.0', range), range);
      assert.ok(semver.satisfies('4.0.0', range), range);
      assert.ok(semver.satisfies('4.12.3', range), range);
      assert.ok(!semver.satisfies('5.0.0', range), range);
      // npm ci in this repository links the vovk of packages/vovk, a prerelease until 4.0.0 is out
      assert.ok(
        semver.satisfies(monorepoVersion, range, { includePrerelease: true }),
        `${range} vs ${monorepoVersion}`
      );
    });
  }
});
