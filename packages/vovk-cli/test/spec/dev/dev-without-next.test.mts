import assert from 'node:assert';
import fs from 'node:fs/promises';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import {
  createProject,
  makeSegmentSchema,
  startCLI,
  startSchemaServer,
  userSegmentSchema,
} from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_dev_without_next');
const exists = (filePath: string) => fs.stat(filePath).then(Boolean, () => false);

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
});
