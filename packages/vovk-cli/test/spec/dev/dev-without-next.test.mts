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
  getFakeNextBin,
  getFreePort,
  makeSegmentSchema,
  startCLI,
  startSchemaServer,
  userSegmentSchema,
} from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_dev_without_next');
const exists = (filePath: string) => fs.stat(filePath).then(Boolean, () => false);
const hasOpenSSL = spawnSync('openssl', ['version']).status === 0;

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

  await it('Picks up an edit of a .cjs config', async () => {
    const configPath = path.join(projectDir, 'vovk.config.cjs');
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0' },
      'vovk.config.cjs': `module.exports = ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'src/app/layout.tsx': '',
    });

    const dev = startCLI(['dev'], { cwd: projectDir, env: { PORT: '3314' } });

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
      env: { PORT: '3314' },
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
      'node_modules/.bin/next': getFakeNextBin({}),
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    await fs.chmod(path.join(projectDir, 'node_modules/.bin/next'), 0o755);

    const dev = startCLI(['dev', '--next-dev'], { cwd: projectDir, env: { PORT: await getFreePort() } });

    assert.strictEqual(await dev.exitCode, 1, dev.getOutput());
    assert.match(dev.getOutput(), /tss/);
    assert.doesNotMatch(dev.getOutput(), /Unhandled Rejection/);
  });

  await it('Requests the schema on the port given to next dev with -p', async () => {
    await createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': `export default ${JSON.stringify({ composedClient: { prettifyClient: false } })};`,
      'node_modules/.bin/next': getFakeNextBin({ '': makeSegmentSchema('') }),
      'src/app/api/[[...vovk]]/route.ts': '',
    });
    await fs.chmod(path.join(projectDir, 'node_modules/.bin/next'), 0o755);

    // next dev prefers -p to PORT
    const dev = startCLI(['dev', '--next-dev', '--exit', '--', '-p', await getFreePort()], {
      cwd: projectDir,
      env: { PORT: await getFreePort() },
    });

    assert.strictEqual(await dev.exitCode, 0, dev.getOutput());
    const rootSchema = JSON.parse(await fs.readFile(path.join(projectDir, '.vovk-schema/root.json'), 'utf-8'));
    assert.deepStrictEqual(Object.keys(rootSchema.controllers), ['UserRPC'], dev.getOutput());
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
});
