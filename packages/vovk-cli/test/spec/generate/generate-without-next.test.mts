import assert from 'node:assert';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { createProject, runCLI, startCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_generate_without_next');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const exists = async (file: string) => !!(await fs.stat(path.join(projectDir, file)).catch(() => null));
const configFile = (config: object) => `export default ${JSON.stringify(config)};`;
const segmentSchema = (segmentName: string, rpcModuleName: string) => ({
  ...userSegmentSchema,
  segmentName,
  controllers: { [rpcModuleName]: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName } },
});

const tscPath = createRequire(import.meta.url).resolve('typescript/bin/tsc');
// the errors tsc reports for the project's own tsconfig.json, empty when it type-checks
const typecheckProject = (cwd: string) =>
  promisify(execFile)(process.execPath, [tscPath, '--noEmit', '-p', 'tsconfig.json'], { cwd }).then(
    () => '',
    (error: { stdout: string }) => error.stdout
  );

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

  await it('Writes a client that type-checks under module nodenext without allowImportingTsExtensions', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'tsconfig.json': {
        compilerOptions: {
          module: 'nodenext',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          resolveJsonModule: true,
        },
        include: ['client'],
      },
      'vovk.config.mjs': configFile({ composedClient: { outDir: 'client', prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.strictEqual(await typecheckProject(projectDir), '');
  });

  await it('Writes a client that type-checks under module nodenext in a CommonJS package', async () => {
    await createProject(projectDir, {
      // no "type": "module", so nodenext reads every .ts file as CommonJS, like in a default Next.js app
      'package.json': { name: 'app', version: '1.0.0' },
      'tsconfig.json': {
        compilerOptions: {
          module: 'nodenext',
          allowImportingTsExtensions: true,
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          resolveJsonModule: true,
        },
        include: ['client'],
      },
      'vovk.config.mjs': configFile({ composedClient: { outDir: 'client', prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.strictEqual(await typecheckProject(projectDir), '');
  });

  await it('Writes a client that type-checks under module node16', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'tsconfig.json': {
        compilerOptions: { module: 'node16', strict: true, noEmit: true, skipLibCheck: true, resolveJsonModule: true },
        include: ['client'],
      },
      'vovk.config.mjs': configFile({ composedClient: { outDir: 'client', prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.strictEqual(await typecheckProject(projectDir), '');
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

  await it('Imports the template front matter modules from the project, not from vovk-cli', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        clientTemplateDefs: { greeting: { templatePath: './templates/greeting' } },
        composedClient: { fromTemplates: ['greeting'], outDir: 'out', prettifyClient: false },
      }),
      // installed in the project only, as a global or npx vovk-cli finds vovk-python and vovk-rust
      'node_modules/greeting-helpers/package.json': { name: 'greeting-helpers', type: 'module', exports: './index.js' },
      'node_modules/greeting-helpers/index.js': "export const greet = (name) => 'Hello, ' + name;\n",
      'templates/greeting/greeting.txt.ejs': `---
imports:
  - greeting-helpers
---
<%= t.imports['greeting-helpers'].greet(t.package.name) %>`,
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.strictEqual(await read('out/greeting.txt'), 'Hello, app');
  });

  await it('Applies the composedClient options of a template definition', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { fromTemplates: ['ts', 'tsPublic', 'tsAdmin'], prettifyClient: false },
        clientTemplateDefs: {
          tsPublic: { extends: 'ts', composedClient: { outDir: './public-client', excludeSegments: ['admin'] } },
          tsAdmin: {
            extends: 'ts',
            composedClient: {
              outDir: './admin-client',
              includeSegments: ['admin'],
              outputConfig: { origin: 'https://admin.example.com' },
            },
          },
        },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/admin.json': segmentSchema('admin', 'AdminRPC'),
    });

    await runCLI(['generate'], { cwd: projectDir });

    const client = await read('src/client/index.ts');
    assert.ok(client.includes('export const UserRPC') && client.includes('export const AdminRPC'), client);
    const publicClient = await read('public-client/index.ts');
    assert.ok(publicClient.includes('export const UserRPC'), publicClient);
    assert.ok(!publicClient.includes('AdminRPC'), publicClient);
    const adminClient = await read('admin-client/index.ts');
    assert.ok(adminClient.includes('export const AdminRPC'), adminClient);
    assert.ok(!adminClient.includes('UserRPC'), adminClient);
    assert.ok(adminClient.includes('https://admin.example.com'), adminClient);
  });

  await it('Applies the segmentedClient options of a template definition', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { enabled: false },
        segmentedClient: { enabled: true, fromTemplates: ['ts', 'tsPublic'], prettifyClient: false },
        clientTemplateDefs: {
          tsPublic: { extends: 'ts', segmentedClient: { outDir: './public-client', excludeSegments: ['admin'] } },
        },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/admin.json': segmentSchema('admin', 'AdminRPC'),
    });

    await runCLI(['generate'], { cwd: projectDir });

    assert.deepStrictEqual((await fs.readdir(path.join(projectDir, 'src/client'))).sort(), ['admin', 'root']);
    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'public-client')), ['root']);
  });

  await it('Names Python and Rust packages after py_name and rs_name', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'acme-api', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { prettifyClient: false },
        outputConfig: { package: { py_name: 'acme_py', rs_name: 'acme_rs' } },
      }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'py', '--out', 'dist_python'], { cwd: projectDir });
    await runCLI(['generate', '--from', 'rs', '--out', 'dist_rust'], { cwd: projectDir });

    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'dist_python/src')), ['acme_py']);
    assert.match(await read('dist_python/pyproject.toml'), /^name = "acme_py"$/m);
    assert.match(await read('dist_python/README.md'), /^from acme_py import UserRPC$/m);
    assert.match(await read('dist_rust/Cargo.toml'), /^name = "acme_rs"$/m);
    assert.match(await read('dist_rust/README.md'), /^use acme_rs::user_rpc;$/m);
  });

  await it('Imports a package with a scoped name by its Python and Rust name in the README samples', async () => {
    await createProject(projectDir, {
      'package.json': { name: '@acme/web-app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'py', '--out', 'dist_python'], { cwd: projectDir });
    await runCLI(['generate', '--from', 'rs', '--out', 'dist_rust'], { cwd: projectDir });

    assert.match(await read('dist_python/README.md'), /^from acme_web_app import UserRPC$/m);
    assert.match(await read('dist_rust/README.md'), /^use acme_web_app::user_rpc;$/m);
  });

  await it('Generates the client from the schema folder of another project given with --schema-path', async () => {
    await createProject(projectDir, {
      'backend/.vovk-schema/root.json': userSegmentSchema,
      // a Next.js app with no segments of its own
      'frontend/package.json': { name: 'frontend', version: '1.0.0', type: 'module' },
      'frontend/vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'frontend/src/app/page.tsx': 'export default function Page() { return null; }',
    });

    const { stdout, stderr } = await runCLI(
      ['generate', '--schema-path', '../backend/.vovk-schema', '--out', 'client'],
      {
        cwd: path.join(projectDir, 'frontend'),
      }
    );

    const index = await read('frontend/client/index.ts');
    assert.ok(index.includes('export const UserRPC'), index);
    assert.doesNotMatch(stdout + stderr, /no route file/);
  });

  await it('Removes the client files of a removed segment that holds another segment', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { enabled: false },
        segmentedClient: { enabled: true, prettifyClient: false },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '',
      'src/app/api/admin/users/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
      '.vovk-schema/admin.json': segmentSchema('admin', 'AdminRPC'),
      '.vovk-schema/admin/users.json': segmentSchema('admin/users', 'AdminUsersRPC'),
    });
    await runCLI(['generate'], { cwd: projectDir });
    assert.ok((await read('src/client/admin/index.ts')).includes('AdminRPC'));

    await fs.rm(path.join(projectDir, 'src/app/api/admin/[[...vovk]]'), { recursive: true });
    await fs.rm(path.join(projectDir, '.vovk-schema/admin.json'));
    await runCLI(['generate'], { cwd: projectDir });

    assert.deepStrictEqual(await fs.readdir(path.join(projectDir, 'src/client/admin')), ['users']);
    assert.ok((await read('src/client/admin/users/index.ts')).includes('AdminUsersRPC'));
  });

  await it('Says nothing about build output inside the folder of a segment', async () => {
    // what cargo build and Python leave next to the generated files
    for (const [template, buildFile] of [
      ['rs', 'seg/root/target/debug/build.log'],
      ['py', 'seg/root/src/app_root/__pycache__/__init__.cpython-311.pyc'],
    ]) {
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': configFile({
          composedClient: { enabled: false },
          segmentedClient: { enabled: true, fromTemplates: [template], outDir: 'seg', prettifyClient: false },
        }),
        'src/app/api/[[...vovk]]/route.ts': '',
        '.vovk-schema/root.json': userSegmentSchema,
      });
      await runCLI(['generate'], { cwd: projectDir });
      await fs.mkdir(path.dirname(path.join(projectDir, buildFile)), { recursive: true });
      await fs.writeFile(path.join(projectDir, buildFile), 'build output');

      const { stdout, stderr } = await runCLI(['generate'], { cwd: projectDir });

      assert.doesNotMatch(stdout + stderr, /not a known segment/, template);
      assert.ok(await exists(buildFile), buildFile);
    }
  });

  await it('Refuses two templates that write the same file', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { enabled: false },
        // both put a README.md into each segment folder
        segmentedClient: { enabled: true, fromTemplates: ['py', 'rs'], outDir: 'seg', prettifyClient: false },
      }),
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await assert.rejects(runCLI(['generate'], { cwd: projectDir }), (error: Error) => {
      assert.ok(error.message.includes(path.join('seg', 'root', 'README.md')), error.message);
      assert.ok(error.message.includes('pyReadme') && error.message.includes('rsReadme'), error.message);
      return true;
    });
  });

  await it('Refuses two templates that write the same file into one --out folder', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await assert.rejects(
      runCLI(['generate', '--from', 'py', '--from', 'rs', '--out', 'x'], { cwd: projectDir }),
      (error: Error) => {
        assert.ok(error.message.includes(path.join('x', 'README.md')), error.message);
        assert.ok(error.message.includes('pyReadme') && error.message.includes('rsReadme'), error.message);
        return true;
      }
    );
    await assert.rejects(fs.access(path.join(projectDir, 'x')));
  });

  await it('Gives the OpenAPI document and the Python package a version when package.json has none', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.vovk-schema/root.json': userSegmentSchema,
    });

    await runCLI(['generate', '--from', 'openapiJson', '--from', 'pyPkg', '--out', 'out'], { cwd: projectDir });

    const { info } = JSON.parse(await read('out/openapi.json'));
    assert.ok(typeof info.version === 'string' && info.version, JSON.stringify(info));
    assert.match(await read('out/pyproject.toml'), /^version = "[^"]+"$/m);
  });
});
