import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, test } from 'node:test';

const cliPath = path.join(import.meta.dirname, '../../vovk-cli/dist/index.mjs');
const projectDirs: string[] = [];

after(() => {
  for (const dir of projectDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// the src/lib.rs that rs writes for a project with one segment per entry of these controllers
function generateLib(segments: Record<string, Record<string, unknown>>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-rust-src-'));
  projectDirs.push(dir);
  fs.mkdirSync(path.join(dir, '.vovk-schema'));
  for (const [segmentName, controllers] of Object.entries(segments)) {
    const segment = {
      $schema: 'https://vovk.dev/api/schema/v3/segment.json',
      emitSchema: true,
      segmentName,
      segmentType: 'segment',
      controllers,
    };
    fs.writeFileSync(path.join(dir, `.vovk-schema/${segmentName || 'root'}.json`), JSON.stringify(segment));
  }
  const config = { composedClient: { fromTemplates: ['rs'], prettifyClient: false } };
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return fs.readFileSync(path.join(dir, 'dist_rust/src/lib.rs'), 'utf-8');
}

const controller = (rpcModuleName: string, handlers: Record<string, unknown>) => ({
  [rpcModuleName]: { rpcModuleName, originalControllerName: rpcModuleName, prefix: 'things', handlers },
});

const list = { list: { httpMethod: 'GET', path: '', validation: {} } };

const topLevelModules = (source: string) => [...source.matchAll(/^pub mod (\w+) \{/gm)].map(([, name]) => name);

describe('rs src/lib.rs', () => {
  test('bytes go out as the first concrete type the procedure takes, else a wildcard other than */*', () => {
    const upload = (contentType: string[]) => ({
      httpMethod: 'POST',
      path: contentType.join('-'),
      validation: { body: { type: 'string', format: 'binary', 'x-contentType': contentType } },
    });
    const source = generateLib({
      '': controller('UploadRPC', {
        any: upload(['*/*']),
        wildcardFirst: upload(['image/*', 'image/png']),
        wildcard: upload(['image/*']),
      }),
    });
    const types = [...source.matchAll(/RequestBody::Binary\(body, "([^"]+)"\)/g)].map(([, type]) => type);

    assert.deepStrictEqual(types, ['application/octet-stream', 'image/png', 'image/*']);
  });

  test('module names alike in snake_case, or taken by the crate, get the first free suffix across segments', () => {
    const source = generateLib({
      '': { ...controller('UserRPC', list), ...controller('HttpRequest', list), ...controller('ReadFullSchema', list) },
      other: controller('UserRpc', list),
    });

    assert.deepStrictEqual(topLevelModules(source).toSorted(), [
      'http_request_2',
      'read_full_schema_2',
      'user_rpc',
      'user_rpc_2',
    ]);
    assert.match(source, /^pub use reqwest;$/m);
  });

  test('a module named reqwest keeps its name: the crate then has no reqwest re-export', () => {
    const source = generateLib({ '': controller('Reqwest', list) });

    assert.deepStrictEqual(topLevelModules(source), ['reqwest']);
    assert.doesNotMatch(source, /^pub use reqwest;$/m);
  });

  test('no path starts at crate::, so the files can be a module of another crate', () => {
    const source = generateLib({ '': controller('UserRPC', list) });
    const httpRequest = fs.readFileSync(
      new URL('../client-templates/rs-src/http_request.rs', import.meta.url),
      'utf-8'
    );

    assert.doesNotMatch(source, /\bcrate::/);
    assert.doesNotMatch(httpRequest, /\bcrate::/);
  });

  test('a JSON-or-file union body also gets a function that sends its branches without a file as JSON', () => {
    const file = { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] };
    const data = { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] };
    const post = (path: string, branches: unknown[], contentType: string[]) => ({
      httpMethod: 'POST',
      path,
      validation: { body: { anyOf: branches, 'x-contentType': contentType } },
    });
    // a mixin's body: one branch per content type, each with its own
    const text = { type: 'object', properties: { s: { type: 'string' } }, required: ['s'] };
    const mixinBranches = [
      { ...data, 'x-contentType': ['application/json'] },
      { ...text, 'x-contentType': ['application/x-www-form-urlencoded'] },
      { ...file, 'x-contentType': ['multipart/form-data'] },
    ];
    const source = generateLib({
      '': controller('FormRPC', {
        jsonOrFile: post('a', [data, file], ['application/json', 'multipart/form-data']),
        onlyFiles: post('b', [file, file], ['application/json', 'multipart/form-data']),
        formOnly: post('c', [data, file], ['multipart/form-data']),
        mixin: post('d', mixinBranches, [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
        ]),
      }),
    });
    const functions = [...source.matchAll(/^ {4}pub async fn (\w+)\(/gm)].map(([, name]) => name);
    const jsonBodyOf = (name: string) => source.slice(source.indexOf(`pub mod ${name}_json_ {`)).split('\n    }\n')[0];

    assert.deepStrictEqual(functions, [
      'json_or_file',
      'json_or_file_json',
      'only_files',
      'form_only',
      'mixin',
      'mixin_json',
    ]);
    assert.match(source, /pub async fn json_or_file\(\s*body: reqwest::multipart::Form,/);
    assert.match(source, /pub async fn json_or_file_json\(\s*body: json_or_file_json_::body,/);
    assert.match(jsonBodyOf('json_or_file'), /pub struct body \{\s*pub n: f64,\s*\}/);
    // the urlencoded branch is a form's: only the JSON one is left
    assert.match(jsonBodyOf('mixin'), /pub struct body \{\s*pub n: f64,\s*\}/);
  });

  test('the function with _json is left out when a handler already has its name', () => {
    const file = { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] };
    const data = { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] };
    const source = generateLib({
      '': controller('FormRPC', {
        save: {
          httpMethod: 'POST',
          path: 'a',
          validation: { body: { anyOf: [data, file], 'x-contentType': ['application/json', 'multipart/form-data'] } },
        },
        saveJSON: { httpMethod: 'POST', path: 'b', validation: { body: data } },
      }),
    });
    const functions = [...source.matchAll(/^ {4}pub async fn (\w+)\(/gm)].map(([, name]) => name);

    assert.deepStrictEqual(functions, ['save', 'save_json']);
  });
});
