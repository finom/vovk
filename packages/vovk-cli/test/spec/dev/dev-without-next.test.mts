import assert from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import {
  createProject,
  fakeNextPackage,
  getFakeNextBin,
  getFreePort,
  makeSegmentSchema,
  runCLI,
  startCLI,
  startSchemaServer,
  userSegmentSchema,
} from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_dev_without_next');
const exists = (filePath: string) => fs.stat(filePath).then(Boolean, () => false);
const hasOpenSSL = spawnSync('openssl', ['version']).status === 0;
const hasGit = spawnSync('git', ['--version']).status === 0;
const configFile = (config: object) => `export default ${JSON.stringify(config)};`;
const readFile = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8').catch(() => '');
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// the schema the dev server sends for a segment whose controller class has these procedures
const segmentWith = (segmentName: string, controllers: Record<string, { className: string; handlers: string[] }>) => ({
  ...makeSegmentSchema(segmentName),
  controllers: Object.fromEntries(
    Object.entries(controllers).map(([rpcModuleName, { className, handlers }]) => [
      rpcModuleName,
      {
        ...userSegmentSchema.controllers.UserRPC,
        rpcModuleName,
        originalControllerName: className,
        handlers: Object.fromEntries(handlers.map((name) => [name, { httpMethod: 'GET', path: name, validation: {} }])),
      },
    ])
  ),
});

// polls, so a watcher that gets there by a retry passes too
async function waitUntil(check: () => Promise<boolean>, timeoutMs = 15_000) {
  const start = Date.now();
  while (!(await check())) {
    if (Date.now() - start > timeoutMs) return false;
    await sleep(250);
  }
  return true;
}

// a mixin read from a file, so it needs no network
const petstoreSpec = {
  openapi: '3.1.0',
  info: { title: 'Petstore', version: '1.0.0' },
  servers: [{ url: 'https://petstore.example.com' }],
  paths: { '/pets': { get: { operationId: 'listPets', responses: { 200: { description: 'OK' } } } } },
};
const petstoreMixin = {
  petstore: {
    openAPIMixin: { source: { file: './petstore.json' }, getModuleName: 'PetstoreAPI', getMethodName: 'auto' },
  },
};

after(async () => {
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('vovk dev in a project without Next.js', async () => {
  await it('Requests the schema from the local dev server when an origin is set', async () => {
    const requestedUrls: string[] = [];
    const server = http.createServer((req, res) => {
      requestedUrls.push(req.url ?? '');
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ schema: userSegmentSchema }));
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));

    try {
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': `export default ${JSON.stringify({
          composedClient: { prettifyClient: false },
          outputConfig: { origin: 'https://api.example.com' },
        })};`,
        'src/app/api/[[...vovk]]/route.ts': '',
      });

      // --exit ends the watcher once the schema and the client are written
      const dev = startCLI(['dev', '--exit'], {
        cwd: projectDir,
        env: { PORT: String((server.address() as AddressInfo).port) },
      });

      assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
      assert.deepStrictEqual(requestedUrls, ['/api/_schema_'], dev.getOutput());
      const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
      assert.deepStrictEqual(rootSchema.controllers, userSegmentSchema.controllers);
    } finally {
      server.close();
    }
  });

  await it('Names the schema URL and a Next.js basePath once when the schema request gets a 404', async () => {
    // what a Next.js app with a basePath answers at /api/_schema_
    const thirdRequest = Promise.withResolvers<void>();
    let requestCount = 0;
    const server = http.createServer((_req, res) => {
      if (++requestCount === 3) thirdRequest.resolve();
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end('<!DOCTYPE html><html><body>This page could not be found.</body></html>');
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: String(port) } });
    try {
      // the answer to the second request is logged by the time the third one comes
      await thirdRequest.promise;
    } finally {
      await dev.stop();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }

    const output = dev.getOutput();
    const reports = output.split('\n').filter((line) => line.includes(`http://localhost:${port}/api/_schema_`));
    assert.strictEqual(reports.length, 1, output);
    assert.match(reports[0], /basePath/, output);
    assert.doesNotMatch(output, /Unexpected token|DOCTYPE/, output);
  });

  await it('Picks up an edit of a .cjs config', async () => {
    const configPath = path.join(projectDir, 'vovk.config.cjs');
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0' },
      'vovk.config.cjs': `module.exports = ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/layout.tsx': '',
    });

    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    try {
      await dev.waitForOutput(/Ready in/);
      // give the file watcher a moment before the edit it has to catch
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fs.appendFile(configPath, '\n// edited\n');
      await dev.waitForOutput(/Config file has been updated/);
    } finally {
      await dev.stop();
    }
  });

  await it('Resolves an absolute modulesDir and --schema-out', async () => {
    const modulesDir = path.join(projectDir, 'absolute-modules');
    const schemaOut = path.join(projectDir, 'absolute-schema');
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ modulesDir, composedClient: { prettifyClient: false } })};`,
      'src/app/layout.tsx': '',
      'absolute-modules/.gitkeep': '',
    });

    const dev = startCLI(['dev', '--schema-out', schemaOut, '--log-level', 'debug'], {
      cwd: projectDir,
      env: { PORT: await getFreePort() },
    });

    try {
      // the config watcher writes _meta.json once it is ready
      await dev.waitForOutput(/Meta JSON is up to date at|Unhandled Rejection/);
    } finally {
      await dev.stop();
    }

    const output = dev.getOutput();
    assert.ok(output.includes(`Meta JSON is up to date at ${path.join(schemaOut, '_meta.json')}`), output);
    assert.ok(output.includes(`Watching modules at ${modulesDir}`), output);
    assert.ok(await exists(path.join(schemaOut, '_meta.json')), output);
  });

  await it('Ignores a segment named "root" added while it runs', async () => {
    const server = await startSchemaServer({
      '': makeSegmentSchema(''),
      root: makeSegmentSchema('root', 'InternalRPC'),
    });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    const rootRouteFile = path.join(projectDir, 'src/app/api/root/[[...vovk]]/route.ts');
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      await fs.mkdir(path.dirname(rootRouteFile), { recursive: true });
      await fs.writeFile(rootRouteFile, '');
      await dev.waitForOutput(/can't be named "root"|Segment "root" has been added/);
      // an edit makes the watcher request the schema of the segment the file belongs to
      await fs.appendFile(rootRouteFile, '// edited\n');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      await dev.stop();
      await server.close();
    }

    const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
    assert.strictEqual(rootSchema.segmentName, '', dev.getOutput());
    assert.deepStrictEqual(Object.keys(rootSchema.controllers), ['UserRPC'], dev.getOutput());
    assert.match(dev.getOutput(), /A segment can't be named "root"/);
  });

  await it('Drops a removed segment from the client', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema(''), foo: makeSegmentSchema('foo', 'FooRPC') });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/foo/[[...vovk]]/route.ts': '',
    });
    const readClient = () => fs.readFile(path.join(projectDir, 'src/client/index.ts'), 'utf-8');
    const dev = startCLI(['dev', '--log-level', 'debug'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      assert.match(await readClient(), /FooRPC/);

      const since = dev.getOutput().length;
      await fs.rm(path.join(projectDir, 'src/app/api/foo'), { recursive: true });
      await dev.waitForOutput(/Composed client (is generated|is up to date)/, 20_000, since);
    } finally {
      await dev.stop();
      await server.close();
    }

    assert.doesNotMatch(await readClient(), /FooRPC/, dev.getOutput());
    assert.match(await readClient(), /UserRPC/);
  });

  await it('Points the generated client at the --schema-out folder', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema('') });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev', '--exit', '--schema-out', 'custom-schema'], {
      cwd: projectDir,
      env: { PORT: server.port },
    });
    const exitCode = await dev.exitCode;
    await server.close();

    assert.strictEqual(exitCode, 0, dev.getOutput());
    const schemaTs = await fs.readFile(path.join(projectDir, 'src/client/schema.ts'), 'utf-8');
    assert.match(schemaTs, /from '\.\/\.\.\/\.\.\/custom-schema\/root\.json'/, schemaTs);
    assert.match(schemaTs, /from '\.\/\.\.\/\.\.\/custom-schema\/_meta\.json'/, schemaTs);
    assert.ok(!(await exists(path.join(projectDir, '.vovk-schema'))), dev.getOutput());
  });

  await it('Turns TLS checks off for the dev server schema request only', { skip: !hasOpenSSL }, async () => {
    const certDir = path.join(projectDir, 'cert');
    await fs.mkdir(certDir, { recursive: true });
    // a self-signed certificate, like the one next dev --experimental-https makes
    execFileSync(
      'openssl',
      ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'key.pem', '-out', 'cert.pem', '-days', '2'].concat([
        '-subj',
        '/CN=localhost',
      ]),
      { cwd: certDir, stdio: 'ignore' }
    );
    const pathsServed: string[] = [];
    const vendorSpec = (operationId: string) => ({
      openapi: '3.1.0',
      info: { title: 'vendor', version: '1' },
      servers: [{ url: 'https://api.vendor.example' }],
      paths: { '/pets': { get: { operationId, responses: { 200: { description: 'ok' } } } } },
    });
    // stands for the dev server and for a third-party OpenAPI spec host someone intercepts
    const server = https.createServer(
      {
        key: await fs.readFile(path.join(certDir, 'key.pem')),
        cert: await fs.readFile(path.join(certDir, 'cert.pem')),
      },
      (req, res) => {
        pathsServed.push(req.url ?? '');
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(
          JSON.stringify(req.url === '/api/_schema_' ? { schema: makeSegmentSchema('') } : vendorSpec('injected'))
        );
      }
    );
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as AddressInfo).port;
    const fallbackPath = path.join(projectDir, 'vendor.json');
    await fs.writeFile(fallbackPath, JSON.stringify(vendorSpec('listPets')));
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify({ name: 'app', version: '1.0.0', type: 'module' })
    );
    await fs.writeFile(
      path.join(projectDir, 'vovk.config.mjs'),
      `export default ${JSON.stringify({
        devHttps: true,
        composedClient: { prettifyClient: false },
        outputConfig: {
          segments: {
            vendor: {
              openAPIMixin: { source: { url: `https://127.0.0.1:${port}/openapi.json`, fallback: './vendor.json' } },
            },
          },
        },
      })};`
    );
    await fs.mkdir(path.join(projectDir, 'src/app/api/[[...vovk]]'), { recursive: true });
    await fs.writeFile(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'), '');

    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: String(port) } });
    try {
      await dev.waitForOutput(/Composed client is generated/);
    } finally {
      await dev.stop();
      server.closeAllConnections();
      server.close();
    }

    const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
    assert.deepStrictEqual(Object.keys(rootSchema.controllers), ['UserRPC'], dev.getOutput());
    assert.deepStrictEqual(
      pathsServed.filter((servedPath) => servedPath !== '/api/_schema_'),
      [],
      dev.getOutput()
    );
    assert.deepStrictEqual(JSON.parse(await fs.readFile(fallbackPath, 'utf-8')), vendorSpec('listPets'));
  });

  await it('Exits with code 1 when --exit gets no schema', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    // nothing listens on the port, so every schema request fails until the retries run out
    const dev = startCLI(['dev', '--exit'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    assert.strictEqual(await dev.exitCode, 1, dev.getOutput());
    assert.match(dev.getOutput(), /Failed to request schema for the root segment after 5 attempts/);
  });

  await it('Exits with code 1 when --exit fails to generate the client', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema('') });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({
        composedClient: { fromTemplates: ['broken'], prettifyClient: false },
        clientTemplateDefs: { broken: { templatePath: './broken-template/' } },
      })};`,
      // the placeholder renders, the client with a controller doesn't
      'broken-template/index.ts.ejs':
        "<% if (Object.values(t.schema.segments).some((s) => Object.keys(s.controllers).length)) throw new Error('broken template'); %>export {};",
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev', '--exit'], { cwd: projectDir, env: { PORT: server.port } });
    const exitCode = await dev.exitCode;
    await server.close();

    assert.strictEqual(exitCode, 1, dev.getOutput());
    assert.match(dev.getOutput(), /broken template/);
  });

  await it('Exits with code 1 when the watcher started by --next-dev fails to start', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { fromTemplates: ['tss'] } })};`,
      ...fakeNextPackage(getFakeNextBin({})),
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev', '--next-dev'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    assert.strictEqual(await dev.exitCode, 1, dev.getOutput());
    assert.match(dev.getOutput(), /tss/);
    assert.doesNotMatch(dev.getOutput(), /Unhandled Rejection/);
  });

  await it('Requests the schema on the port given to next dev with -p', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      ...fakeNextPackage(getFakeNextBin({ '': makeSegmentSchema('') })),
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    // next dev prefers -p to PORT
    const dev = startCLI(['dev', '--next-dev', '--exit', '--', '-p', await getFreePort()], {
      cwd: projectDir,
      env: { PORT: await getFreePort() },
    });

    assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
    const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
    assert.deepStrictEqual(Object.keys(rootSchema.controllers), ['UserRPC'], dev.getOutput());
  });

  await it("Runs the project's own next where node_modules/.bin has none, as under Yarn PnP", async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      // npx looks for node_modules/.bin/next, so it would run another next or none
      ...fakeNextPackage(getFakeNextBin({ '': makeSegmentSchema('') })),
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev', '--next-dev', '--exit'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
    assert.match(dev.getOutput(), /next dev listens on/);
  });

  await it('Starts offline with a remote OpenAPI mixin in the config', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema('') });
    const specUrl = `http://127.0.0.1:${await getFreePort()}/openapi.json`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({
        composedClient: { prettifyClient: false },
        outputConfig: { segments: { petstore: { openAPIMixin: { source: { url: specUrl } } } } },
      })};`,
      'src/app/api/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });
    try {
      await dev.waitForOutput(/Ready in/);
      // the client needs the spec, so its generation fails and the watcher keeps running
      await dev.waitForOutput(/Failed to generate the client/);
    } finally {
      await dev.stop();
      await server.close();
    }

    const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
    assert.deepStrictEqual(Object.keys(rootSchema.controllers), ['UserRPC'], dev.getOutput());
  });

  await it('Starts with includeSegments or excludeSegments that name an OpenAPI mixin', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema('') });
    try {
      for (const [segmentsOption, expectedModules] of [
        [{ includeSegments: ['', 'petstore'] }, ['UserRPC', 'PetstoreAPI']],
        [{ excludeSegments: ['petstore'] }, ['UserRPC']],
      ] as const) {
        await createProject(projectDir, {
          'package.json': { name: 'app', version: '1.0.0', type: 'module' },
          'vovk.config.mjs': `export default ${JSON.stringify({
            composedClient: { prettifyClient: false, ...segmentsOption },
            outputConfig: { segments: petstoreMixin },
          })};`,
          'petstore.json': petstoreSpec,
          'src/app/api/[[...vovk]]/route.ts': '',
        });

        const dev = startCLI(['dev', '--exit'], { cwd: projectDir, env: { PORT: server.port } });

        assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
        const index = await fs.readFile(path.join(projectDir, 'src/client/index.ts'), 'utf-8');
        for (const moduleName of ['UserRPC', 'PetstoreAPI']) {
          const isExpected = (expectedModules as readonly string[]).includes(moduleName);
          assert.strictEqual(index.includes(`export const ${moduleName}`), isExpected, index);
        }
      }
    } finally {
      await server.close();
    }
  });

  await it('Keeps the segmented client of an OpenAPI mixin when it starts', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({
        composedClient: { enabled: false },
        segmentedClient: { enabled: true, prettifyClient: false, outDir: 'seg' },
        outputConfig: { segments: petstoreMixin },
      })};`,
      'petstore.json': petstoreSpec,
      'src/app/api/[[...vovk]]/route.ts': '',
      '.vovk-schema/root.json': makeSegmentSchema(''),
    });
    await runCLI(['generate'], { cwd: projectDir });
    const mixinIndex = path.join(projectDir, 'seg/petstore/index.ts');
    assert.ok(await exists(mixinIndex));

    // nothing answers the schema requests, so only the start can change the client
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: await getFreePort() } });
    try {
      await dev.waitForOutput(/Ready in/);
    } finally {
      await dev.stop();
    }

    assert.ok(await exists(mixinIndex), dev.getOutput());
    assert.match(await fs.readFile(mixinIndex, 'utf-8'), /export const PetstoreAPI/);
  });

  await it('Generates the client of a project whose only segment is an OpenAPI mixin', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({
        composedClient: { prettifyClient: false },
        outputConfig: { segments: petstoreMixin },
      })};`,
      'petstore.json': petstoreSpec,
      'src/app/page.tsx': 'export default function Page() { return null; }',
    });

    const dev = startCLI(['dev', '--exit'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
    const index = await fs.readFile(path.join(projectDir, 'src/client/index.ts'), 'utf-8');
    assert.ok(index.includes('export const PetstoreAPI'), `${index}\n${dev.getOutput()}`);
  });

  await it('Requests the schema of a controller whose class is renamed', async () => {
    const schemas: Record<string, object> = {
      '': segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser'] } }),
    };
    const server = await startSchemaServer(schemas);
    const controllerFile = path.join(projectDir, 'src/modules/user/user-controller.ts');
    const controller = (className: string, procedures: string) =>
      `import { get, prefix } from 'vovk';\n\n@prefix('users')\nexport default class ${className} {\n${procedures}}\n`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      // the route imports the default export, as vovk new writes it, so a rename changes the controller file only
      'src/app/api/[[...vovk]]/route.ts': "import UserController from '../../../modules/user/user-controller';\n",
      'src/modules/user/user-controller.ts': controller('UserController', '  @get() static getUser() {}\n'),
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      schemas[''] = segmentWith('', { UserRPC: { className: 'UsersController', handlers: ['getUser', 'listUsers'] } });
      await fs.writeFile(
        controllerFile,
        controller('UsersController', "  @get() static getUser() {}\n  @get('all') static listUsers() {}\n")
      );

      const isUpdated = await waitUntil(async () => (await readFile('.vovk-schema/root.json')).includes('listUsers'));
      assert.ok(isUpdated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Requests the schema again once a module changes after a failed request', async () => {
    const schemas: Record<string, object> = {
      '': segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser'] } }),
    };
    const server = await startSchemaServer(schemas);
    const serviceFile = path.join(projectDir, 'src/modules/user/user-service.ts');
    const controller = (procedures: string) =>
      `import { get, prefix } from 'vovk';\nimport UserService from './user-service';\n\n@prefix('users')\nexport default class UserController {\n${procedures}}\n`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': "import UserController from '../../../modules/user/user-controller';\n",
      'src/modules/user/user-controller.ts': controller('  @get() static getUser() { return UserService.get(); }\n'),
      'src/modules/user/user-service.ts': 'export default class UserService { static get() { return null; } }\n',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      // a procedure is added while the service has a syntax error, so the dev server fails every route
      delete schemas[''];
      const requestCount = server.requests.length;
      await fs.writeFile(serviceFile, 'export default class UserService { static get() { return [; } }\n');
      await fs.writeFile(
        path.join(projectDir, 'src/modules/user/user-controller.ts'),
        controller(
          "  @get() static getUser() { return UserService.get(); }\n  @get('count') static countUsers() { return 0; }\n"
        )
      );
      // the schema request made meanwhile gets a 404
      assert.ok(await waitUntil(async () => server.requests.length > requestCount), dev.getOutput());
      // the fix lands in the service, a module without a controller
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'countUsers'] } });
      await fs.writeFile(serviceFile, 'export default class UserService { static get() { return null; } }\n');

      const isUpdated = await waitUntil(async () => (await readFile('.vovk-schema/root.json')).includes('countUsers'));
      assert.ok(isUpdated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Requests a failed schema again once a file outside the modules folder changes', async () => {
    const schemas: Record<string, object> = {
      '': segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser'] } }),
    };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': "import { limit } from './limit';\n",
      'src/app/api/[[...vovk]]/limit.ts': 'export const limit = 10;\n',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      // the route doesn't compile meanwhile, so its schema request gets a 404
      delete schemas[''];
      const since = dev.getOutput().length;
      await fs.appendFile(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'), '// edited\n');
      await dev.waitForOutput(/got 404/, 20_000, since);
      // the fix lands in a file next to the route
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'listUsers'] } });
      await fs.writeFile(path.join(projectDir, 'src/app/api/[[...vovk]]/limit.ts'), 'export const limit = 20;\n');

      const isUpdated = await waitUntil(async () => (await readFile('.vovk-schema/root.json')).includes('listUsers'));
      assert.ok(isUpdated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Keeps the client in step with the other segments while one segment has no schema', async () => {
    // the new segment "v2" doesn't compile, so the dev server has no schema for it
    const schemas: Record<string, object> = { '': makeSegmentSchema('') };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      await fs.mkdir(path.join(projectDir, 'src/app/api/v2/[[...vovk]]'), { recursive: true });
      await fs.writeFile(path.join(projectDir, 'src/app/api/v2/[[...vovk]]/route.ts'), '');
      // the watcher knows the new segment once it asks for its schema
      assert.ok(await waitUntil(async () => server.requests.includes('/api/v2/_schema_')), dev.getOutput());
      // meanwhile the root segment gets a second controller
      const since = dev.getOutput().length;
      schemas[''] = segmentWith('', {
        UserRPC: { className: 'UserController', handlers: ['getUser'] },
        PostRPC: { className: 'PostController', handlers: ['getPost'] },
      });
      await fs.appendFile(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'), '// PostRPC\n');
      await dev.waitForOutput(/Schema for the root segment has been updated/, 20_000, since);

      const isGenerated = await waitUntil(async () => (await readFile('src/client/index.ts')).includes('PostRPC'));
      assert.ok(isGenerated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Requests the schema of a route file added to a folder that is already there', async () => {
    const server = await startSchemaServer({ '': makeSegmentSchema(''), v2: makeSegmentSchema('v2', 'V2RPC') });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/v2/[[...vovk]]/.gitkeep': '',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      await fs.writeFile(path.join(projectDir, 'src/app/api/v2/[[...vovk]]/route.ts'), '');

      const isGenerated = await waitUntil(async () => (await readFile('src/client/index.ts')).includes('V2RPC'));
      assert.ok(isGenerated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Requests the schema when a validation module next to a controller changes', async () => {
    const withQuery = (keys: string[]) => {
      const schema = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['listUsers'] } });
      schema.controllers.UserRPC.handlers.listUsers.validation = {
        query: { type: 'object', properties: Object.fromEntries(keys.map((key) => [key, { type: 'string' }])) },
      };
      return schema;
    };
    const schemas: Record<string, object> = { '': withQuery(['search']) };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': "import UserController from '../../../modules/user/user-controller';\n",
      'src/modules/user/user-controller.ts':
        "import { get, prefix, procedure } from 'vovk';\nimport { UserQuery } from './user-schemas';\n\n@prefix('users')\nexport default class UserController {\n  @get() static listUsers = procedure({ query: UserQuery }).handle(() => []);\n}\n",
      'src/modules/user/user-schemas.ts':
        "import { z } from 'zod';\nexport const UserQuery = z.object({ search: z.string() });\n",
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      schemas[''] = withQuery(['search', 'limit']);
      await fs.writeFile(
        path.join(projectDir, 'src/modules/user/user-schemas.ts'),
        "import { z } from 'zod';\nexport const UserQuery = z.object({ search: z.string(), limit: z.string() });\n"
      );

      const isUpdated = await waitUntil(async () => (await readFile('.vovk-schema/root.json')).includes('"limit"'));
      assert.ok(isUpdated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Exits with code 1 when next dev stops before --exit generates the client', async () => {
    // Next.js exits with code 0 when its server process dies; the OOM killer ends a process with a signal
    for (const nextDev of [
      'setTimeout(() => process.exit(0), 500);',
      "setTimeout(() => process.kill(process.pid, 'SIGKILL'), 500);",
    ]) {
      await createProject(projectDir, {
        'package.json': { name: 'app', version: '1.0.0', type: 'module' },
        'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
        ...fakeNextPackage(`#!/usr/bin/env node\n${nextDev}\n`),
        'src/app/api/[[...vovk]]/route.ts': '',
      });

      const dev = startCLI(['dev', '--next-dev', '--exit'], { cwd: projectDir, env: { PORT: await getFreePort() } });

      assert.strictEqual(await dev.exitCode, 1, `${nextDev}\n${dev.getOutput()}`);
    }
  });

  await it('Exits with code 1 when --exit ignores the schema of a segment', async () => {
    // a route file copied from the admin segment into billing still says segmentName: 'admin'
    const server = await startSchemaServer({
      '': makeSegmentSchema(''),
      billing: makeSegmentSchema('admin', 'AdminRPC'),
    });
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/billing/[[...vovk]]/route.ts': '',
    });

    const dev = startCLI(['dev', '--exit'], { cwd: projectDir, env: { PORT: server.port } });
    const exitCode = await dev.exitCode;
    await server.close();

    assert.match(dev.getOutput(), /reported a different segment name/);
    assert.strictEqual(exitCode, 1, dev.getOutput());
  });

  await it('Leaves a segment that turns emitSchema off out of the next generated client', async () => {
    const schemas: Record<string, object> = {
      '': makeSegmentSchema(''),
      admin: makeSegmentSchema('admin', 'AdminRPC'),
    };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '// emitSchema: true\n',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      assert.match(await readFile('src/client/index.ts'), /AdminRPC/);
      const since = dev.getOutput().length;
      // what getSchema answers for a segment with emitSchema: false
      schemas.admin = { ...makeSegmentSchema('admin'), emitSchema: false, controllers: {} };
      await fs.writeFile(path.join(projectDir, 'src/app/api/admin/[[...vovk]]/route.ts'), '// emitSchema: false\n');
      await dev.waitForOutput(/Composed client is generated/, 20_000, since);
    } finally {
      await dev.stop();
      await server.close();
    }

    // prebuild and CI generate the client from the schema files
    await runCLI(['generate'], { cwd: projectDir });
    assert.doesNotMatch(await readFile('src/client/index.ts'), /AdminRPC/, await readFile('.vovk-schema/admin.json'));
  });

  await it('Writes the schema files again after the schema folder is deleted', async () => {
    const schemas: Record<string, object> = { '': makeSegmentSchema(''), foo: makeSegmentSchema('foo', 'FooRPC') };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/foo/[[...vovk]]/route.ts': '',
    });
    const dev = startCLI(['dev', '--log-level', 'debug'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      await fs.rm(path.join(projectDir, '.vovk-schema'), { recursive: true });
      await sleep(1000);
      const since = dev.getOutput().length;
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'listUsers'] } });
      await fs.appendFile(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'), '// edited\n');
      await dev.waitForOutput(/Handling received schema from the root segment/, 20_000, since);

      // the client imports every one of them
      const schemaTs = await readFile('src/client/schema.ts');
      const imported = [...schemaTs.matchAll(/from '\.\/(\S+\.json)'/g)].map(([, file]) => file);
      assert.ok(imported.length, schemaTs);
      const isWritten = await waitUntil(async () => {
        for (const file of imported) if (!(await exists(path.join(projectDir, 'src/client', file)))) return false;
        return true;
      });
      assert.ok(isWritten, `${imported.join(', ')}\n${dev.getOutput()}`);
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Keeps watching the modules folder after it is removed and created again', async () => {
    const schemas: Record<string, object> = {
      '': segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser'] } }),
    };
    const server = await startSchemaServer(schemas);
    const controllerFile = path.join(projectDir, 'src/modules/user/user-controller.ts');
    const controller = (procedures: string) =>
      `import { get, prefix } from 'vovk';\n\n@prefix('users')\nexport default class UserController {\n${procedures}}\n`;
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': "import UserController from '../../../modules/user/user-controller';\n",
      'src/modules/user/user-controller.ts': controller('  @get() static getUser() {}\n'),
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      // a git switch to a branch without the folder and back
      await fs.rm(path.join(projectDir, 'src/modules'), { recursive: true });
      await sleep(2000);
      await fs.mkdir(path.dirname(controllerFile), { recursive: true });
      await fs.writeFile(controllerFile, controller('  @get() static getUser() {}\n'));
      await sleep(2000);
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'listUsers'] } });
      await fs.writeFile(
        controllerFile,
        controller("  @get() static getUser() {}\n  @get('all') static listUsers() {}\n")
      );

      const isUpdated = await waitUntil(async () => (await readFile('.vovk-schema/root.json')).includes('listUsers'));
      assert.ok(isUpdated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Keeps watching the segments folder after it is removed and created again', async () => {
    const schemas: Record<string, object> = { '': makeSegmentSchema('') };
    const server = await startSchemaServer(schemas);
    const routeFile = path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts');
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      // a git switch to a branch without the folder and back
      await fs.rm(path.join(projectDir, 'src/app/api'), { recursive: true });
      await sleep(2000);
      await fs.mkdir(path.dirname(routeFile), { recursive: true });
      await fs.writeFile(routeFile, '');
      await sleep(2000);
      schemas[''] = segmentWith('', {
        UserRPC: { className: 'UserController', handlers: ['getUser'] },
        PostRPC: { className: 'PostController', handlers: ['getPost'] },
      });
      await fs.appendFile(routeFile, '// PostRPC\n');

      const isGenerated = await waitUntil(async () => (await readFile('src/client/index.ts')).includes('PostRPC'));
      assert.ok(isGenerated, dev.getOutput());
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Regenerates the client from the current OpenAPI mixin file', async () => {
    const petsSpec = (operationIds: string[]) => ({
      openapi: '3.1.0',
      info: { title: 'Pets', version: '1.0.0' },
      servers: [{ url: 'https://pets.example.com' }],
      paths: Object.fromEntries(
        operationIds.map((operationId) => [
          `/${operationId}`,
          { get: { operationId, responses: { 200: { description: 'OK' } } } },
        ])
      ),
    });
    const schemas: Record<string, object> = { '': makeSegmentSchema('') };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { prettifyClient: false },
        outputConfig: {
          segments: { pets: { openAPIMixin: { source: { file: './pets.json' }, getModuleName: 'PetsRPC' } } },
        },
      }),
      'pets.json': petsSpec(['listPets']),
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      await fs.writeFile(path.join(projectDir, 'pets.json'), JSON.stringify(petsSpec(['listPets', 'getOwners'])));
      await sleep(1500);
      // and any change that regenerates the client
      const since = dev.getOutput().length;
      schemas[''] = segmentWith('', {
        UserRPC: { className: 'UserController', handlers: ['getUser'] },
        PostRPC: { className: 'PostController', handlers: ['getPost'] },
      });
      await fs.appendFile(path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts'), '// PostRPC\n');
      await dev.waitForOutput(/Composed client is generated/, 20_000, since);

      const isUpdated = await waitUntil(async () => (await readFile('src/client/mixins.json')).includes('getOwners'));
      assert.ok(isUpdated, await readFile('src/client/mixins.json'));
    } finally {
      await dev.stop();
      await server.close();
    }
  });

  await it('Writes the newest client when two generations overlap', async () => {
    const schemas: Record<string, object> = { '': makeSegmentSchema('') };
    const server = await startSchemaServer(schemas);
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({
        composedClient: { fromTemplates: ['handlers'], prettifyClient: false },
        clientTemplateDefs: { handlers: { templatePath: './handlers-template/' } },
      }),
      // takes 4 s while a procedure is named "slow", like a big client under prettier on a busy machine
      'handlers-template/handlers.ts.ejs':
        "<%- t.getFirstLineBanner() %>\n<% const names = Object.values(t.schema.segments).flatMap((s) => Object.values(s.controllers).flatMap((c) => Object.keys(c.handlers))); if (names.includes('slow')) await new Promise((resolve) => setTimeout(resolve, 4000)); %>export const handlers = <%- JSON.stringify(names) %>;\n",
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    const routeFile = path.join(projectDir, 'src/app/api/[[...vovk]]/route.ts');
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: server.port } });

    try {
      await dev.waitForOutput(/Composed client is generated/);
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'slow'] } });
      await fs.appendFile(routeFile, '// 1\n');
      await sleep(3000);
      schemas[''] = segmentWith('', { UserRPC: { className: 'UserController', handlers: ['getUser', 'fast'] } });
      await fs.appendFile(routeFile, '// 2\n');
      await sleep(8000);
    } finally {
      await dev.stop();
      await server.close();
    }

    assert.match(await readFile('src/client/handlers.ts'), /\["getUser","fast"\]/);
  });

  await it('Deletes the schema file of a segment that a checkout removes while it adds another', {
    skip: !hasGit,
  }, async () => {
    const segmentNames = ['admin', 'billing'];
    // the dev server answers for the segments whose route file is there
    const server = http.createServer(async (req, res) => {
      const segmentName = req.url?.match(/^\/api\/(?:(.+)\/)?_schema_$/)?.[1] ?? '';
      const hasRoute = await exists(path.join(projectDir, 'src/app/api', segmentName, '[[...vovk]]/route.ts'));
      res.writeHead(hasRoute ? 200 : 404, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify(hasRoute ? { schema: makeSegmentSchema(segmentName, `${segmentName || 'User'}RPC`) } : {})
      );
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': configFile({ composedClient: { prettifyClient: false } }),
      '.gitignore': '.vovk-schema\nsrc/client\n',
      'src/app/api/[[...vovk]]/route.ts': '',
      'src/app/api/admin/[[...vovk]]/route.ts': '',
    });
    const git = (...args: string[]) => execFileSync('git', args, { cwd: projectDir, stdio: 'pipe' });
    const commit = (message: string) => {
      git('add', '-A');
      git('-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-qm', message);
    };
    git('init', '-q', '-b', 'main');
    commit('admin');
    git('switch', '-qc', 'feature');
    await fs.rm(path.join(projectDir, 'src/app/api/admin'), { recursive: true });
    await fs.mkdir(path.join(projectDir, 'src/app/api/billing/[[...vovk]]'), { recursive: true });
    await fs.writeFile(path.join(projectDir, 'src/app/api/billing/[[...vovk]]/route.ts'), '');
    commit('billing replaces admin');
    git('switch', '-q', 'main');
    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: String((server.address() as AddressInfo).port) } });
    const schemaFiles = async () => (await fs.readdir(path.join(projectDir, '.vovk-schema'))).toSorted();

    try {
      await dev.waitForOutput(/Composed client is generated/);
      for (const branch of ['feature', 'main', 'feature', 'main']) {
        git('switch', '-q', branch);
        await sleep(5000);
        const expected = ['_meta.json', `${branch === 'main' ? segmentNames[0] : segmentNames[1]}.json`, 'root.json'];
        assert.deepStrictEqual(await schemaFiles(), expected, `on ${branch}\n${dev.getOutput()}`);
      }
    } finally {
      await dev.stop();
      server.closeAllConnections();
      server.close();
    }
  });
});
