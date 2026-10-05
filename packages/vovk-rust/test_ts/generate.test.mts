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

// generates the rs client of a project with one segment of these controllers; returns a reader of dist_rust
function generate(controllers: Record<string, unknown>, outputConfig: object = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-rust-'));
  projectDirs.push(dir);
  const segment = {
    $schema: 'https://vovk.dev/api/schema/v3/segment.json',
    emitSchema: true,
    segmentName: '',
    segmentType: 'segment',
    controllers,
  };
  const config = { composedClient: { fromTemplates: ['rs'], prettifyClient: false }, outputConfig };
  fs.mkdirSync(path.join(dir, '.vovk-schema'));
  fs.writeFileSync(path.join(dir, '.vovk-schema/root.json'), JSON.stringify(segment));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return (file: string) => fs.readFileSync(path.join(dir, 'dist_rust', file), 'utf-8');
}

const userController = (handlers: Record<string, unknown>) => ({
  UserRPC: { rpcModuleName: 'UserRPC', originalControllerName: 'UserController', prefix: 'users', handlers },
});

const listUsers = userController({ list: { httpMethod: 'GET', path: '', validation: {} } });

describe('the generated crate', () => {
  test('handler names that are alike in snake_case get a function and a types module each', () => {
    const idSchema = { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] };
    const read = generate(
      userController({
        getUserByID: { httpMethod: 'GET', path: 'by-id', validation: { query: idSchema } },
        getUserById: { httpMethod: 'POST', path: 'by-id', validation: { body: idSchema } },
      })
    );
    const source = read('src/lib.rs');
    const functions = [...source.matchAll(/^ {4}pub async fn (\w+)\(/gm)].map(([, name]) => name);
    const modules = [...source.matchAll(/^ {4}pub mod (\w+) \{/gm)].map(([, name]) => name);
    const handlers = [...source.matchAll(/handler_name: "(\w+)"/g)].map(([, name]) => name);

    // two items of one name in a module are error E0428
    assert.strictEqual(functions.length, new Set(functions).size, `functions: ${functions.join(', ')}`);
    assert.strictEqual(modules.length, new Set(modules).size, `modules: ${modules.join(', ')}`);
    assert.deepStrictEqual(handlers.toSorted(), ['getUserByID', 'getUserById']);
  });

  test('the README adds the crate as a dependency: it is a library', () => {
    const readme = generate(listUsers)('README.md');

    assert.ok(readme.includes('cargo add app'), readme);
    assert.ok(!readme.includes('cargo install'), readme);
  });

  test('Cargo.toml declares the Rust version the crate needs', () => {
    const cargoToml = generate(listUsers)('Cargo.toml');
    const packageTable = cargoToml.slice(cargoToml.indexOf('[package]')).split(/^\s*\[(?!package])/m)[0];

    assert.match(packageTable, /^rust-version = "1\.85"$/m, cargoToml);
    // the 2021 edition's resolver ignores rust-version: built on its own, the crate would take dependencies that need 1.88
    assert.match(packageTable, /^resolver = "3"$/m, cargoToml);
  });

  test('the README starts with readme.banner', () => {
    const readme = generate(listUsers, { readme: { banner: 'Banner line' } })('README.md');
    const bannerAt = readme.indexOf('Banner line');

    assert.ok(bannerAt !== -1 && bannerAt < readme.indexOf('\n# '), readme);
  });
});
