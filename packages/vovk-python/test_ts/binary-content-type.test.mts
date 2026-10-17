import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

const cliPath = path.join(import.meta.dirname, '../../vovk-cli/dist/index.mjs');
const projectDirs: string[] = [];

after(() => {
  for (const dir of projectDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// the __init__.py of a py client with one binary procedure per declared list of content types
function generateBinaryProcedures(declared: string[][]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-python-'));
  projectDirs.push(dir);
  const handlers = Object.fromEntries(
    declared.map((contentTypes, i) => [
      `upload${i}`,
      {
        httpMethod: 'POST',
        path: `upload-${i}`,
        validation: { body: { type: 'string', format: 'binary', 'x-contentType': contentTypes } },
      },
    ])
  );
  const segment = {
    $schema: 'https://vovk.dev/api/schema/v3/segment.json',
    emitSchema: true,
    segmentName: '',
    segmentType: 'segment',
    controllers: {
      FileRPC: { rpcModuleName: 'FileRPC', originalControllerName: 'FileController', prefix: 'file', handlers },
    },
  };
  const config = { composedClient: { fromTemplates: ['py'], prettifyClient: false } };
  fs.mkdirSync(path.join(dir, '.vovk-schema'));
  fs.writeFileSync(path.join(dir, '.vovk-schema/root.json'), JSON.stringify(segment));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return fs.readFileSync(path.join(dir, 'dist_python/src/app/__init__.py'), 'utf-8');
}

// as the TypeScript client sends untyped bytes, which the /content-type docs page describes
test('bytes go out as the type the TypeScript client sends untyped bytes as', () => {
  const cases: [string[], string][] = [
    [['*/*'], 'application/octet-stream'],
    [['image/*', 'image/png'], 'image/png'],
    [['*/*', 'application/pdf'], 'application/pdf'],
    [['application/json', 'image/png'], 'image/png'],
    [['image/png'], 'image/png'],
    [['image/*'], 'image/*'],
    [['application/*'], 'application/*'],
    [['application/vnd.api+json', 'text/csv'], 'text/csv'],
    [['application/json'], 'application/json'],
  ];
  const source = generateBinaryProcedures(cases.map(([declared]) => declared));
  const sent = Array.from(source.matchAll(/^ {12}body_content_type="([^"]*)",$/gm), ([, contentType]) => contentType);
  assert.deepEqual(
    sent,
    cases.map(([, contentType]) => contentType)
  );
});
