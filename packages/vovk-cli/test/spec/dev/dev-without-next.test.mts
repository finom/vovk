import assert from 'node:assert';
import fs from 'node:fs/promises';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import { createProject, startCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_dev_without_next');

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
});
