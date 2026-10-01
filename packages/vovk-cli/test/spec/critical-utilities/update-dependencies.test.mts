import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it, mock } from 'node:test';
import { updateDependenciesWithoutInstalling } from '../../../dist/init/update-dependencies-without-installing.mjs';
import { createProject } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_update_dependencies');
const log = { info() {}, warn() {}, error() {}, debug() {}, raw: { info() {} } } as unknown as Parameters<
  typeof updateDependenciesWithoutInstalling
>[0]['log'];

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

// dist-tags as the npm registry has them, vovk-ajv and vovk-python have no beta
const distTags: Record<string, Record<string, string>> = {
  vovk: { latest: '3.7.0', beta: '4.0.0-beta.0' },
  'vovk-ajv': { latest: '0.1.0' },
  'vovk-cli': { latest: '0.2.0', beta: '0.3.0-beta.0' },
  'vovk-python': { latest: '0.0.3' },
};

await describe('updateDependenciesWithoutInstalling', async () => {
  await it('Takes the latest version of a package without the channel', async () => {
    await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0' } });
    const fetchMock = mock.method(globalThis, 'fetch', async (url: string) => {
      const name = decodeURIComponent(new URL(url).pathname.slice(1));
      return new Response(JSON.stringify({ 'dist-tags': distTags[name], versions: {} }));
    });
    // test runs use the packages of this repo, the registry is what this test is about
    const nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      await updateDependenciesWithoutInstalling({
        log,
        dir: projectDir,
        dependencyNames: ['vovk', 'vovk-ajv'],
        devDependencyNames: ['vovk-cli', 'vovk-python'],
        channel: 'beta',
      });
    } finally {
      process.env.NODE_ENV = nodeEnv;
      fetchMock.mock.restore();
    }

    const { dependencies, devDependencies } = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')
    );
    assert.deepStrictEqual(dependencies, { vovk: '^4.0.0-beta.0', 'vovk-ajv': '^0.1.0' });
    assert.deepStrictEqual(devDependencies, { 'vovk-cli': '^0.3.0-beta.0', 'vovk-python': '^0.0.3' });
  });
});
