import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI, startCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

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

  await it('Fails on a schema file that is not valid JSON', async () => {
    const conflicted = JSON.stringify({ ...userSegmentSchema, segmentName: 'foo' }, null, 2).replace(
      '"emitSchema": true,',
      '<<<<<<< HEAD\n  "emitSchema": true,\n=======\n  "emitSchema": false,\n>>>>>>> feature'
    );
    for (const file of ['.vovk-schema/foo.json', '.vovk-schema/_meta.json']) {
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
        'src/app/api/[[...vovk]]/route.ts': '',
        'src/app/api/foo/[[...vovk]]/route.ts': '',
        '.vovk-schema/root.json': userSegmentSchema,
        '.vovk-schema/foo.json': { ...userSegmentSchema, segmentName: 'foo' },
        [file]: conflicted,
      });

      await assert.rejects(runCLI(['generate'], { cwd: projectDir }), (error: Error) =>
        error.message.includes(path.join(projectDir, file))
      );
    }
  });

  await it('Leaves out a segment whose route file is gone', async () => {
    const fooSegmentSchema = {
      ...userSegmentSchema,
      segmentName: 'foo',
      controllers: { FooRPC: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName: 'FooRPC' } },
    };
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/foo.json': fooSegmentSchema,
    });

    const { stdout, stderr } = await runCLI(['generate'], { cwd: projectDir });

    const index = await read('src/client/index.ts');
    assert.ok(index.includes('UserRPC') && !index.includes('FooRPC') && !index.includes('from ""'), index);
    assert.match(stdout + stderr, /Segment "foo" has a schema file but no route file/);
  });

  await it('Writes no empty import when the project has no route files', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--out', 'out'], { cwd: projectDir });

    const index = await read('out/index.ts');
    assert.ok(index.includes('UserRPC') && !index.includes('from ""'), index);
  });

  await it('Generates the client as soon as --watch starts', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    const cli = startCLI(['generate', '--watch', '1'], { cwd: projectDir });
    try {
      await cli.waitForOutput(/Composed client is generated/, 10_000);
      assert.ok((await read('src/client/index.ts')).includes('UserRPC'));
    } finally {
      await cli.stop();
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

  await it('Puts a whole Rust and Python package into each folder of a segmented client', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ segmentedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/foo/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/foo.json': { ...userSegmentSchema, segmentName: 'foo' },
    });
    const generateClients = async () => {
      const outputs = [];
      for (const [template, outDir] of [
        ['rs', 'seg_rust'],
        ['py', 'seg_py'],
      ]) {
        const { stdout, stderr } = await runCLI(
          ['generate', '--segmented-only', '--segmented-from', template, '--segmented-out', outDir],
          { cwd: projectDir }
        );
        outputs.push(stdout, stderr);
      }
      assert.doesNotMatch(outputs.join(''), /not a known segment/);
    };

    await generateClients();

    for (const [segmentDir, name] of [
      ['root', 'app_root'],
      ['foo', 'app_foo'],
    ]) {
      assert.match(await read(`seg_rust/${segmentDir}/Cargo.toml`), new RegExp(`^name = "${name}"$`, 'm'));
      assert.ok(await read(`seg_rust/${segmentDir}/src/lib.rs`));
      assert.ok(await read(`seg_rust/${segmentDir}/src/schema.json`));
      assert.match(await read(`seg_py/${segmentDir}/pyproject.toml`), new RegExp(`^name = "${name}"$`, 'm'));
      assert.ok(await read(`seg_py/${segmentDir}/src/${name}/__init__.py`));
    }

    // a removed segment takes its whole package along
    await fs.rm(path.join(projectDir, 'src/app/api/foo'), { recursive: true });
    await fs.rm(path.join(projectDir, '.vovk-schema/foo.json'));
    await generateClients();

    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'seg_rust')), ['root']);
    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'seg_py')), ['root']);
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
