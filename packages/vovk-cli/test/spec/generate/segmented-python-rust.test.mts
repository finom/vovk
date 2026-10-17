import assert from 'node:assert';
import { execFile, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { promisify } from 'node:util';
import { createProject, runCLI, userSegmentSchema } from '../../lib/minimal-project.mts';

const projectDir = path.join(process.cwd(), 'tmp_segmented_python_rust');
const read = (file: string) => fs.readFile(path.join(projectDir, file), 'utf-8');
const hasPythonClientDeps = spawnSync('python3', ['-c', 'import requests, jsonschema']).status === 0;
const hasCargo = spawnSync('cargo', ['--version']).status === 0;

// a segment whose one procedure validates its body
const segmentWith = (segmentName: string, rpcModuleName: string, prefix: string) => ({
  ...userSegmentSchema,
  segmentName,
  controllers: {
    [rpcModuleName]: {
      rpcModuleName,
      originalControllerName: rpcModuleName.replace(/RPC$/, 'Controller'),
      prefix,
      handlers: {
        create: {
          httpMethod: 'POST',
          path: '',
          validation: {
            body: { type: 'object', properties: { hello: { type: 'string' } }, required: ['hello'] },
          },
        },
      },
    },
  },
});

// segment, package name, RPC module, the path a call goes to
const segments = [
  ['root', 'app_root', 'UserRPC', '/api/users'],
  ['foo/client', 'app_foo_client', 'ThingRPC', '/api/foo/client/things'],
] as const;

// answers every call with the path and the body it got
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ url: req.url, body: JSON.parse(body || 'null') }));
  });
});

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  await createProject(projectDir, {
    'package.json': { name: 'app', version: '1.0.0', type: 'module' },
    'vovk.config.mjs': `export default ${JSON.stringify({
      composedClient: { enabled: false },
      segmentedClient: { prettifyClient: false },
      outputConfig: { origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}` },
    })};`,
    'src/app/api/[[...vovk]]/route.ts': '',
    'src/app/api/foo/client/[[...vovk]]/route.ts': '',
    '.vovk-schema/root.json': segmentWith('', 'UserRPC', 'users'),
    '.vovk-schema/foo/client.json': segmentWith('foo/client', 'ThingRPC', 'things'),
  });
  for (const [template, outDir] of [
    ['py', 'seg_py'],
    ['rs', 'seg_rust'],
  ]) {
    await runCLI(['generate', '--segmented-only', '--segmented-from', template, '--segmented-out', outDir], {
      cwd: projectDir,
    });
  }
});

after(async () => {
  server.close();
  await fs.rm(projectDir, { recursive: true, force: true });
});

await describe('The Python and Rust packages of a segmented client', async () => {
  await it('Hold the schema of their own segment only', async () => {
    for (const [segmentDir, name] of segments) {
      const segmentName = segmentDir === 'root' ? '' : segmentDir;
      const pySchema = JSON.parse(await read(`seg_py/${segmentDir}/src/${name}/schema.json`));
      const rsSchema = JSON.parse(await read(`seg_rust/${segmentDir}/src/schema.json`));
      assert.deepStrictEqual(Object.keys(pySchema.segments), [segmentName]);
      assert.deepStrictEqual(Object.keys(rsSchema.segments), [segmentName]);
    }
  });

  await it('Import in Python, validate a body and call their own segment', {
    skip: !hasPythonClientDeps && 'python3 with requests and jsonschema not found',
  }, async () => {
    const script = `
import json, sys
import jsonschema
sys.path.insert(0, sys.argv[1])
rpc = getattr(__import__(sys.argv[2]), sys.argv[3])
try:
    rpc.create(body={'hello': 1})
    sys.exit('the body was sent without validation')
except jsonschema.ValidationError:
    pass
print(json.dumps(rpc.create(body={'hello': 'world'})))
`;
    for (const [segmentDir, name, rpcModuleName, url] of segments) {
      const { stdout } = await promisify(execFile)(
        'python3',
        ['-I', '-c', script, path.join(projectDir, `seg_py/${segmentDir}/src`), name, rpcModuleName],
        { cwd: projectDir }
      );
      assert.deepStrictEqual(JSON.parse(stdout), { url, body: { hello: 'world' } }, segmentDir);
    }
  });

  await it('Build in Rust with warnings denied and call their own segment', {
    skip: !hasCargo && 'cargo not found',
  }, async () => {
    const checkDir = path.join(projectDir, 'rust_check');
    await fs.mkdir(path.join(checkDir, 'src'), { recursive: true });
    await fs.writeFile(
      path.join(checkDir, 'Cargo.toml'),
      `[package]
name = "segmented_check"
version = "0.1.0"
edition = "2021"
# as the generated crates, so cargo picks dependency versions that build on the oldest Rust they support
rust-version = "1.85"
resolver = "3"

[dependencies]
app_root = { path = "../seg_rust/root" }
app_foo_client = { path = "../seg_rust/foo/client" }
serde_json = "1"
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
`
    );
    await fs.writeFile(
      path.join(checkDir, 'src/main.rs'),
      `#[tokio::main]
async fn main() {
    let root = app_root::user_rpc::create(
        serde_json::from_value(serde_json::json!({ "hello": "world" })).unwrap(), (), (), None, None, false,
    ).await.unwrap();
    let nested = app_foo_client::thing_rpc::create(
        serde_json::from_value(serde_json::json!({ "hello": "world" })).unwrap(), (), (), None, None, false,
    ).await.unwrap();
    println!("{}", serde_json::json!([root, nested]));
}
`
    );

    // path dependencies aren't lint-capped, so a warning in a generated crate fails the build
    const { stdout } = await promisify(execFile)('cargo', ['run', '--quiet'], {
      cwd: checkDir,
      env: { ...process.env, RUSTFLAGS: '-D warnings', CARGO_TARGET_DIR: path.join(checkDir, 'target') },
      maxBuffer: 16 * 1024 * 1024,
    });
    assert.deepStrictEqual(
      JSON.parse(stdout),
      segments.map(([, , , url]) => ({ url, body: { hello: 'world' } }))
    );
  });
});
