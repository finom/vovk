import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, describe, it, mock } from 'node:test';
import { updateDependenciesWithoutInstalling } from '../../../dist/init/update-dependencies-without-installing.mjs';
import { createProject, startRegistry } from '../../lib/minimal-project.mts';

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

// npm is set up for the registry, as npx sets it from .npmrc, and registry.npmjs.org is out of reach
async function withRegistry(registryUrl: string, run: () => Promise<void>) {
  const env = { npm_config_registry: process.env.npm_config_registry, NODE_ENV: process.env.NODE_ENV };
  const realFetch = globalThis.fetch;
  const fetchMock = mock.method(globalThis, 'fetch', (input: string | URL | Request, init?: RequestInit) =>
    new URL(input instanceof Request ? input.url : input).hostname === 'registry.npmjs.org'
      ? Promise.reject(new TypeError('fetch failed'))
      : realFetch(input, init)
  );
  process.env.npm_config_registry = registryUrl;
  // test runs use the packages of this repo, the registry is what this test is about
  process.env.NODE_ENV = 'production';

  try {
    await run();
  } finally {
    fetchMock.mock.restore();
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

await describe('updateDependenciesWithoutInstalling', async () => {
  await it('Takes the latest version of a package without the channel', async () => {
    await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0' } });
    const registry = await startRegistry(distTags);

    try {
      await withRegistry(registry.url, () =>
        updateDependenciesWithoutInstalling({
          log,
          dir: projectDir,
          dependencyNames: ['vovk', 'vovk-ajv'],
          devDependencyNames: ['vovk-cli', 'vovk-python'],
          channel: 'beta',
        })
      );
    } finally {
      await registry.close();
    }

    const { dependencies, devDependencies } = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')
    );
    assert.deepStrictEqual(dependencies, { vovk: '^4.0.0-beta.0', 'vovk-ajv': '^0.1.0' });
    assert.deepStrictEqual(devDependencies, { 'vovk-cli': '^0.3.0-beta.0', 'vovk-python': '^0.0.3' });
  });

  await it('Reads the dist-tags from the registry npm is configured with', async () => {
    await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0' } });
    const registry = await startRegistry({
      vovk: { latest: '4.0.0' },
      'vovk-ajv': { latest: '0.2.0' },
      'vovk-cli': { latest: '0.4.0' },
    });

    try {
      await withRegistry(registry.url, () =>
        updateDependenciesWithoutInstalling({
          log,
          dir: projectDir,
          dependencyNames: ['vovk', 'vovk-ajv'],
          devDependencyNames: ['vovk-cli'],
          channel: 'latest',
        })
      );
    } finally {
      await registry.close();
    }

    const { dependencies, devDependencies } = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')
    );
    assert.deepStrictEqual(dependencies, { vovk: '^4.0.0', 'vovk-ajv': '^0.2.0' });
    assert.deepStrictEqual(devDependencies, { 'vovk-cli': '^0.4.0' });
  });

  await it('Fails when a package lookup fails', async () => {
    await createProject(projectDir, { 'package.json': { name: 'app', version: '1.0.0' } });
    // the registry has no vovk-ajv
    const registry = await startRegistry({ vovk: { latest: '4.0.0' }, 'vovk-cli': { latest: '0.4.0' } });
    const messages: string[] = [];
    const recordingLog = { ...log, info: (message: string) => messages.push(message) } as typeof log;

    try {
      await assert.rejects(
        withRegistry(registry.url, () =>
          updateDependenciesWithoutInstalling({
            log: recordingLog,
            dir: projectDir,
            dependencyNames: ['vovk', 'vovk-ajv'],
            devDependencyNames: ['vovk-cli'],
            channel: 'latest',
          })
        )
      );
    } finally {
      await registry.close();
    }

    assert.doesNotMatch(messages.join('\n'), /Added/);
  });

  await it('Keeps a dependency the project has on another major, or names the change', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', dependencies: { zod: '^3.25.76' } },
    });
    const fetchMock = mock.method(
      globalThis,
      'fetch',
      async () => new Response(JSON.stringify({ 'dist-tags': { latest: '4.6.5' }, versions: {} }))
    );
    const messages: string[] = [];
    const record = (...args: unknown[]) => {
      messages.push(args.map(String).join(' '));
    };
    const recordingLog = {
      info: record,
      warn: record,
      error: record,
      debug: record,
      raw: { info: record },
    } as unknown as typeof log;

    try {
      await updateDependenciesWithoutInstalling({
        log: recordingLog,
        dir: projectDir,
        dependencyNames: ['zod'],
        devDependencyNames: [],
        channel: 'latest',
      });
    } finally {
      fetchMock.mock.restore();
    }

    const { dependencies } = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8'));
    // the app's own zod 3 code doesn't compile against zod 4, so the switch can't happen silently
    assert.ok(
      dependencies.zod === '^3.25.76' || messages.some((message) => message.includes('3.25.76')),
      `zod became ${dependencies.zod}; log: ${messages.join(' | ')}`
    );
  });

  await it('Keeps a range that meets the floor of vovk, and replaces one below it with a warning', async () => {
    await createProject(projectDir, {
      'package.json': {
        name: 'app',
        version: '1.0.0',
        dependencies: { zod: '^3.25.76', valibot: '^1.3.0' },
        devDependencies: { concurrently: '^8.2.2' },
      },
    });
    const registry = await startRegistry({
      zod: { latest: '4.6.5' },
      valibot: { latest: '1.4.0' },
      concurrently: { latest: '9.2.1' },
    });
    const infos: string[] = [];
    const warnings: string[] = [];
    const recordingLog = {
      ...log,
      info: (message: string) => infos.push(message),
      warn: (message: string) => warnings.push(message),
      raw: { info: (message: string) => infos.push(message) },
    } as unknown as typeof log;

    try {
      await withRegistry(registry.url, () =>
        updateDependenciesWithoutInstalling({
          log: recordingLog,
          dir: projectDir,
          dependencyNames: ['zod', 'valibot'],
          devDependencyNames: ['concurrently'],
          channel: 'latest',
        })
      );
    } finally {
      await registry.close();
    }

    const { dependencies, devDependencies } = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8')
    );
    assert.deepStrictEqual(dependencies, { zod: '^4.6.5', valibot: '^1.3.0' });
    assert.deepStrictEqual(devDependencies, { concurrently: '^8.2.2' });
    assert.deepStrictEqual(warnings, [
      "Changed zod ^3.25.76 → ^4.6.5 in package.json (vovk needs 4.2+; zod 3 code can import 'zod/v3')",
    ]);
    assert.doesNotMatch(infos.join('\n'), /Added/);
  });

  await it('Reads the lowest version a range lets in', async () => {
    const registry = await startRegistry({ zod: { latest: '4.6.5' } });

    try {
      for (const [range, isKept] of [
        ['~4.2.0', true],
        ['>=4.2.0 <5', true],
        ['4.3.x', true],
        ['latest', true],
        ['workspace:*', true],
        ['4.x', false],
        ['^4.2.0 || ^3.25.0', false],
        ['*', false],
        ['<5', false],
      ] as const) {
        await createProject(projectDir, {
          'package.json': { name: 'app', version: '1.0.0', dependencies: { zod: range } },
        });
        await withRegistry(registry.url, () =>
          updateDependenciesWithoutInstalling({
            log,
            dir: projectDir,
            dependencyNames: ['zod'],
            devDependencyNames: [],
            channel: 'latest',
          })
        );
        const { dependencies } = JSON.parse(await fs.readFile(path.join(projectDir, 'package.json'), 'utf-8'));
        assert.strictEqual(dependencies.zod, isKept ? range : '^4.6.5', range);
      }
    } finally {
      await registry.close();
    }
  });
});
