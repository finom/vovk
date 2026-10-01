import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_generate_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const configFile = (config: object) => `export default ${JSON.stringify(config)};`;

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('vovk generate in a project without Next.js', async () => {
  await it('Writes relative import paths that start with ./ or ../', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { prettifyClient: false },
        outputConfig: { imports: { fetcher: './src/client/fetcher' } },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    const index = await read('src/client/index.ts');
    assert.ok(index.includes(`import('./fetcher')`), index);
    assert.ok(index.includes(`from "../app/api/[[...vovk]]/route.ts"`), index);
  });

  await it('Imports the schema without an extension when the project has no tsconfig.json', async () => {
    // outside the repo, so no parent tsconfig.json is found either
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'vovk-no-tsconfig-'));
    try {
      await createProject(dir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
        'src/app/api/[[...vovk]]/route.ts': '',
        '.vovk-schema/root.json': userSegmentSchema,
      });

      await runCLI(['generate'], { cwd: dir });

      const index = await fs.readFile(path.join(dir, 'src/client/index.ts'), 'utf-8');
      assert.ok(index.includes(`import { schema } from './schema';`), index);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  await it('Imports the schema with an extension when tsconfig.json sets module to nodenext', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'tsconfig.json': { compilerOptions: { module: 'nodenext', allowImportingTsExtensions: true, noEmit: true } },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    const index = await read('src/client/index.ts');
    assert.ok(index.includes(`import { schema } from './schema.ts';`), index);
  });

  await it('Resets the root origin to relative URLs with a client origin of null or an empty string', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        outputConfig: { origin: 'https://api.example.com' },
        composedClient: { prettifyClient: false, outputConfig: { origin: null } },
        segmentedClient: { enabled: true, prettifyClient: false, outputConfig: { origin: '' } },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    for (const file of ['src/client/index.ts', 'src/client/root/index.ts']) {
      const index = await read(file);
      assert.ok(index.includes(`createRPC<`) && !index.includes('api.example.com'), index);
    }
  });

  await it('Resolves a relative createRPC import from each segmented client folder', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        segmentedClient: { enabled: true, prettifyClient: false },
        outputConfig: { imports: { createRPC: './src/lib/create-rpc' } },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--segmented-only'], { cwd: projectDir });

    const index = await read('src/client/root/index.ts');
    assert.ok(index.includes(`from '../../lib/create-rpc'`), index);
  });

  await it('Names Python and Rust packages after a scoped package name', async () => {
    await createProject(projectDir, {
      'package.json': { name: '@acme/web-app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'py', '--out', 'dist_python'], { cwd: projectDir });
    await runCLI(['generate', '--from', 'rsPkg', '--out', 'dist_rust'], { cwd: projectDir });

    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'dist_python/src')), ['acme_web_app']);
    assert.match(await read('dist_python/pyproject.toml'), /^name = "acme_web_app"$/m);
    assert.match(await read('dist_rust/Cargo.toml'), /^name = "acme_web_app"$/m);
  });

  await it('Falls back to a package name when package.json has none', async () => {
    await createProject(projectDir, {
      'package.json': { private: true, type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'pyPkg', '--from', 'rsPkg', '--out', 'out'], { cwd: projectDir });

    assert.match(await read('out/pyproject.toml'), /^name = "my_package_name"$/m);
    assert.match(await read('out/Cargo.toml'), /^name = "my_package_name"$/m);
  });

  await it('Rewrites a one-line file when its content changes', async () => {
    const packageJson = { name: 'app', version: '1.0.0', type: 'module' };
    await createProject(projectDir, {
      'package.json': packageJson,
      'vovk.config.mjs': configFile({
        clientTemplateDefs: { version: { templatePath: './templates/version' } },
        composedClient: { fromTemplates: ['version'], outDir: 'out', prettifyClient: false },
      }),
      'templates/version/version.txt.ejs': '<%= t.package.version %>',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });
    assert.strictEqual(await read('out/version.txt'), '1.0.0');

    await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify({ ...packageJson, version: '1.1.0' }));
    await runCLI(['generate'], { cwd: projectDir });
    assert.strictEqual(await read('out/version.txt'), '1.1.0');
  });

  await it('Keeps every module listed in the template front matter imports', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        clientTemplateDefs: { imports: { templatePath: './templates/imports' } },
        composedClient: { fromTemplates: ['imports'], outDir: 'out', prettifyClient: false },
      }),
      'templates/imports/imports.txt.ejs': `---
imports:
  - node:path
  - node:os
---
<%= typeof t.imports['node:path'].join %> <%= typeof t.imports['node:os'].platform %>`,
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.strictEqual(await read('out/imports.txt'), 'function function');
  });
});
