import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, runCLI, startCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_generate_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const exists = async (file: string) => !!(await fs.stat(path.join(projectDir, file)).catch(() => null));
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

  await it('Regenerates with --watch once a changed file is written in full', async () => {
    const petsSpec = (operationId: string) => ({
      openapi: '3.1.0',
      info: { title: 'Pets', version: '1.0.0' },
      paths: { '/pets': { get: { operationId, responses: { 200: { description: 'OK' } } } } },
    });
    const clientSchema = {
      ...userSegmentSchema,
      controllers: { ClientRPC: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName: 'ClientRPC' } },
    };
    const openapiFlags = ['--openapi', 'pets.json', '--openapi-root-url', 'https://pets.example.com'];
    openapiFlags.push('--openapi-module-name', 'PetsRPC', '--openapi-mixin-name', 'pets');
    const runs = [
      {
        flags: [],
        file: '.vovk-schema/root.json',
        content: clientSchema,
        clientFile: 'index.ts',
        expected: 'ClientRPC',
      },
      {
        flags: openapiFlags,
        file: 'pets.json',
        content: petsSpec('listAllPets'),
        clientFile: 'mixins.json',
        expected: 'listAllPets',
      },
    ];

    for (const { flags, file, content, clientFile, expected } of runs) {
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
        'src/app/api/[[...vovk]]/route.ts': '',
        '.vovk-schema/root.json': userSegmentSchema,
        'pets.json': petsSpec('listPets'),
      });

      const cli = startCLI(['generate', '--watch', '1', ...flags], { cwd: projectDir });
      try {
        await cli.waitForOutput(/Composed client is generated/, 10_000);
        // past the 1 second throttle, so the change is read at once
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const since = cli.getOutput().length;
        // a writer that is not atomic: the file is truncated, then written in parts
        const text = JSON.stringify(content, null, 2);
        const handle = await fs.open(path.join(projectDir, file), 'w');
        await handle.write(text.slice(0, 50));
        await new Promise((resolve) => setTimeout(resolve, 50));
        await handle.write(text.slice(50));
        await handle.close();

        await cli.waitForOutput(/Composed client is generated/, 10_000, since);
        assert.ok(!cli.getOutput().slice(since).includes('Failed to regenerate'), cli.getOutput());
        const client = await read(`src/client/${clientFile}`);
        assert.ok(client.includes(expected), client);
      } finally {
        await cli.stop();
      }
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

  await it('Keeps a composed client that sits inside the segmented client folder', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { outDir: './src/client/all', prettifyClient: false },
        segmentedClient: { enabled: true, outDir: './src/client', prettifyClient: false },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/foo/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      // the composed client exports every module by name, so each segment brings its own
      '.vovk-schema/foo.json': {
        ...userSegmentSchema,
        segmentName: 'foo',
        controllers: { FooRPC: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName: 'FooRPC' } },
      },
    });

    for (const args of [['generate'], ['generate'], ['generate', '--segmented-only']]) {
      await runCLI(args, { cwd: projectDir });
      const index = await read('src/client/all/index.ts');
      assert.ok(index.includes('UserRPC') && index.includes('FooRPC'), args.join(' '));
    }
    assert.deepStrictEqual((await fs.readdir(path.join(projectDir, 'src/client'))).sort(), ['all', 'foo', 'root']);
  });

  await it('Keeps the client of a segment renamed in letter case only', async () => {
    const adminSchema = (segmentName: string) => ({
      ...userSegmentSchema,
      segmentName,
      controllers: { AdminRPC: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName: 'AdminRPC' } },
    });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { enabled: false },
        segmentedClient: { enabled: true, prettifyClient: false },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/admin.json': adminSchema('admin'),
    });
    await runCLI(['generate'], { cwd: projectDir });

    await fs.rename(path.join(projectDir, 'src/app/api/admin'), path.join(projectDir, 'src/app/api/Admin'));
    await fs.rm(path.join(projectDir, '.vovk-schema/admin.json'));
    await fs.writeFile(path.join(projectDir, '.vovk-schema/Admin.json'), JSON.stringify(adminSchema('Admin')));
    await runCLI(['generate'], { cwd: projectDir });

    assert.ok((await read('src/client/Admin/index.ts')).includes('AdminRPC'));
  });

  await it('Refuses to replace files it did not generate unless --force is passed', async () => {
    const userIndex = 'export const mine = 1;\n';
    const userSpec = JSON.stringify({ openapi: '3.1.0', info: { title: 'Mine', version: '1.0.0' }, paths: {} });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      'src/client/index.ts': userIndex,
      'src/client/openapi.json': userSpec,
    });

    await assert.rejects(
      runCLI(['generate'], { cwd: projectDir }),
      (error: Error) =>
        error.message.includes(path.join('src', 'client', 'index.ts')) &&
        error.message.includes(path.join('src', 'client', 'openapi.json'))
    );
    assert.strictEqual(await read('src/client/index.ts'), userIndex);
    assert.strictEqual(await read('src/client/openapi.json'), userSpec);
    assert.ok(!(await exists('src/client/schema.ts')), 'nothing is written');

    await runCLI(['generate', '--force'], { cwd: projectDir });
    assert.ok((await read('src/client/index.ts')).includes('UserRPC'));
    assert.notStrictEqual(await read('src/client/openapi.json'), userSpec);
  });

  await it('Replaces the files it generated before', async () => {
    const schemaWith = (handlerName: string) => ({
      ...userSegmentSchema,
      controllers: {
        UserRPC: {
          ...userSegmentSchema.controllers.UserRPC,
          handlers: {
            [handlerName]: {
              httpMethod: 'GET',
              path: '{id}',
              validation: {},
              operationObject: { summary: handlerName },
            },
          },
        },
      },
    });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': schemaWith('getUser'),
    });
    const generateAll = async () => {
      await runCLI(['generate'], { cwd: projectDir });
      await runCLI(['generate', '--from', 'openapiJson', '--out', 'public'], { cwd: projectDir });
      await runCLI(['generate', '--from', 'py', '--out', 'dist_python'], { cwd: projectDir });
    };

    await generateAll();
    // a file an earlier vovk-cli copied as is
    await fs.writeFile(path.join(projectDir, 'dist_python/src/app/api_client.py'), '# an older version\n');
    await fs.writeFile(path.join(projectDir, '.vovk-schema/root.json'), JSON.stringify(schemaWith('findUser')));
    await generateAll();

    for (const file of ['src/client/openapi.json', 'public/openapi.json', 'dist_python/src/app/schema.json']) {
      assert.ok((await read(file)).includes('findUser'), file);
    }
    assert.notStrictEqual(await read('dist_python/src/app/api_client.py'), '# an older version\n');
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
