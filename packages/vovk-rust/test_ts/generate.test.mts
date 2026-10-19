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
function generate(
  controllers: Record<string, unknown>,
  outputConfig: object = {},
  packageJson: object = { name: 'app', version: '1.0.0' }
) {
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
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return (file: string) => fs.readFileSync(path.join(dir, 'dist_rust', file), 'utf-8');
}

const userController = (handlers: Record<string, unknown>) => ({
  UserRPC: { rpcModuleName: 'UserRPC', originalControllerName: 'UserController', prefix: 'users', handlers },
});

const listUsers = userController({ list: { httpMethod: 'GET', path: '', validation: {} } });

// the [package] table of a generated Cargo.toml, without its subtables
const cargoPackageTable = (cargoToml: string) =>
  cargoToml.slice(cargoToml.indexOf('[package]')).split(/^\s*\[(?!package])/m)[0];

const readmeInstallBlock = (readme: string) => readme.match(/^```bash\n([\s\S]*?)^```$/m)?.[1] ?? '';

// an OpenAPI document from a third party may hold any JSON as a title, a summary or a description
const numericTexts = {
  openapi: '3.1.0',
  info: { title: 'Things', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com' }],
  paths: {
    '/thing': {
      get: {
        operationId: 'getThing',
        summary: 5,
        description: 6,
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Thing' } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Thing: {
        type: 'object',
        title: 1,
        description: 123,
        properties: { a: { type: 'string', title: 2, description: 123 } },
      },
    },
  },
};

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

  test('a title or description that is not a string', () => {
    const source = generate(listUsers, {
      segments: { things: { openAPIMixin: { source: { object: numericTexts }, getModuleName: 'ThingsAPI' } } },
    })('src/lib.rs');

    assert.match(source, /pub async fn get_thing\(/);
  });

  test('schema text is never compiled as a doctest, and the files stay whole under rustdoc', () => {
    const description = [
      '```\nlet a = ;\n```',
      '```rust\nlet b = ;\n```',
      'Indented:\n\n    let c = ;',
      '> Quoted:\n>\n>     let d = ;',
      '- item\n\n      let e = ;',
      '````\n```\nlet f = ;\n```\n````',
      '```\nlet g = ;',
    ].join('\n\n');
    const read = generate(
      userController({
        create: {
          httpMethod: 'POST',
          path: '',
          operationObject: { description },
          validation: { body: { type: 'object', description, properties: { a: { type: 'string', description } } } },
        },
      })
    );
    const source = read('src/lib.rs');
    const docLines = [...source.matchAll(/^ *\/\/\/ ?(.*)$/gm)].map(([, line]) => line);

    // rustdoc would drop the module from a host crate's doctest build, and the crate's code that names it with it
    assert.ok(!source.includes('cfg(not(doctest))'), source);
    // every fence opens a text block, and each text closes its fences: the fence of g doesn't run into the text after
    // it; a fence with an info string inside a block is text of that block
    const openFences = (lines: string[], onOpen: (line: string) => void) => {
      let open: string | null = null;
      for (const line of lines) {
        const fence = /^[> ]*(`{3,}|~{3,})(.*)$/.exec(line);
        if (!fence) continue;
        if (!open) {
          open = fence[1];
          onOpen(line);
        } else if (fence[1][0] === open[0] && fence[1].length >= open.length && !fence[2]) open = null;
      }
      return open;
    };
    assert.strictEqual(
      openFences(docLines, (line) => assert.match(line, /^[> ]*(`{3,}|~{3,})text$/, line)),
      null,
      docLines.join('\n')
    );
    assert.ok(!docLines.some((line) => /^(?:[ ]*>)*[ ]{4}/.test(line)), docLines.join('\n'));
    assert.strictEqual(openFences(read('README.md').split('\n'), () => {}), null, read('README.md'));
  });

  test('schema text of only spaces leaves no empty doc comment', () => {
    const source = generate(
      userController({
        create: {
          httpMethod: 'POST',
          path: '',
          validation: {
            body: { type: 'object', title: ' ', description: '\t', properties: { a: { type: 'string', title: ' ' } } },
          },
        },
      })
    )('src/lib.rs');

    assert.doesNotMatch(source, /^ *\/\/\/\s*$/m, source);
  });

  test('the README adds the crate as a dependency: it is a library', () => {
    const readme = generate(listUsers)('README.md');

    assert.ok(readme.includes('cargo add app'), readme);
    assert.ok(!readme.includes('cargo install'), readme);
  });

  test('the README installs the crates its samples use', () => {
    const plain = readmeInstallBlock(generate(listUsers)('README.md'));

    assert.match(plain, /^cargo add tokio --features macros,rt-multi-thread$/m, plain);
    assert.match(plain, /^cargo add serde_json$/m, plain);
    assert.doesNotMatch(plain, /futures-util|reqwest/, plain);

    const read = generate(
      userController({
        stream: {
          httpMethod: 'GET',
          path: 'stream',
          validation: { iteration: { type: 'object', properties: { n: { type: 'number' } } } },
        },
        upload: {
          httpMethod: 'POST',
          path: 'upload',
          validation: {
            body: {
              type: 'object',
              'x-contentType': ['multipart/form-data'],
              properties: { file: { type: 'string', format: 'binary' } },
            },
          },
        },
      }),
      { readme: { installCommand: 'cargo add app --git https://github.com/acme/app' } }
    );
    const install = readmeInstallBlock(read('README.md'));
    // a Form of another reqwest version is another type
    const reqwestVersion = read('Cargo.toml').match(/^\s*\[dependencies\.reqwest\]\n\s*version = "(.+)"$/m)?.[1];

    // installCommand replaces the crate's own line only
    assert.match(install, /^cargo add app --git https:\/\/github\.com\/acme\/app$/m, install);
    assert.doesNotMatch(install, /^cargo add app$/m, install);
    assert.match(install, /^cargo add tokio --features macros,rt-multi-thread$/m, install);
    assert.match(install, /^cargo add serde_json$/m, install);
    assert.match(install, /^cargo add futures-util$/m, install);
    assert.ok(
      reqwestVersion && install.includes(`\ncargo add reqwest@${reqwestVersion} --features multipart\n`),
      install
    );
  });

  test('Cargo.toml declares the Rust version the crate needs', () => {
    const cargoToml = generate(listUsers)('Cargo.toml');
    const packageTable = cargoToml.slice(cargoToml.indexOf('[package]')).split(/^\s*\[(?!package])/m)[0];

    assert.match(packageTable, /^rust-version = "1\.85"$/m, cargoToml);
    // the 2021 edition's resolver ignores rust-version: built on its own, the crate would take dependencies that need 1.88
    assert.match(packageTable, /^resolver = "3"$/m, cargoToml);
  });

  test('Cargo.toml takes the package.json metadata in the forms crates.io accepts', () => {
    const cargoToml = generate(
      listUsers,
      {},
      {
        name: 'app',
        version: '1.0.0',
        description: 'Users API',
        license: 'MIT',
        author: { name: 'Ann', email: 'ann@example.com' },
        homepage: 'https://example.com',
        bugs: { url: 'https://example.com/issues' },
        // the form npm init writes
        repository: { type: 'git', url: 'git+https://github.com/acme/app.git' },
        keywords: [
          'api',
          'next.js',
          'client',
          'web app',
          'rpc',
          'a-keyword-of-21-chars',
          'openapi',
          'types',
          'codegen',
        ],
      }
    )('Cargo.toml');
    const packageTable = cargoPackageTable(cargoToml);
    const keywords = JSON.parse(packageTable.match(/^keywords = (\[[^\]]*\])$/m)?.[1] ?? '[]');

    assert.match(packageTable, /^description = "Users API"$/m, cargoToml);
    assert.match(packageTable, /^license = "MIT"$/m, cargoToml);
    assert.match(packageTable, /^authors = \[ "Ann <ann@example\.com>" \]$/m, cargoToml);
    assert.match(packageTable, /^homepage = "https:\/\/example\.com"$/m, cargoToml);
    assert.match(cargoToml, /^\[package\.metadata\.package\]\nbugs = "https:\/\/example\.com\/issues"$/m, cargoToml);
    // crates.io refuses a URL that isn't http(s), more than 5 keywords,
    // and a keyword other than up to 20 letters, digits, _, - or + that starts with a letter or digit
    assert.match(packageTable, /^repository = "https:\/\/github\.com\/acme\/app\.git"$/m, cargoToml);
    assert.deepStrictEqual(keywords, ['api', 'client', 'rpc', 'openapi', 'types']);
  });

  test("package.json's legacy object forms give a Cargo.toml that cargo reads", () => {
    const read = generate(
      listUsers,
      {},
      {
        name: 'app',
        version: '1.0.0',
        // the legacy npm form of a license
        license: { type: 'MIT', url: 'https://opensource.org/licenses/MIT' },
        author: { email: 'ann@example.com' },
        contributors: [{ email: 'bob@example.com' }, { name: 'Cat', email: 'cat@example.com' }, 'Dan'],
        bugs: { email: 'bugs@example.com' },
      }
    );
    const cargoToml = read('Cargo.toml');
    const packageTable = cargoPackageTable(cargoToml);

    // a [package.license] table fails cargo metadata
    assert.match(packageTable, /^license = "MIT"$/m, cargoToml);
    assert.doesNotMatch(cargoToml, /^\[package\.license\]/m, cargoToml);
    assert.match(packageTable, /^authors = \[ "Cat <cat@example\.com>", "Dan" \]$/m, cargoToml);
    assert.doesNotMatch(cargoToml, /undefined|metadata/, cargoToml);
    assert.match(read('README.md'), /^License: \*\*MIT\*\*$/m);
  });

  test("a repository in npm's other forms is an https URL in Cargo.toml, or is left out", () => {
    const repositories = {
      'github:acme/app': 'https://github.com/acme/app',
      'acme/app': 'https://github.com/acme/app',
      'gitlab:acme/app': 'https://gitlab.com/acme/app',
      'bitbucket:acme/app': 'https://bitbucket.org/acme/app',
      'git+ssh://git@github.com/acme/app.git': 'https://github.com/acme/app.git',
      'git@github.com:acme/app.git': 'https://github.com/acme/app.git',
      'git://github.com/acme/app.git': 'https://github.com/acme/app.git',
      'https://gitlab.com/acme/app': 'https://gitlab.com/acme/app',
      'file:../app': undefined,
    };

    for (const [repository, url] of Object.entries(repositories)) {
      const cargoToml = generate(listUsers, { package: { repository } })('Cargo.toml');

      assert.strictEqual(cargoPackageTable(cargoToml).match(/^repository = "(.*)"$/m)?.[1], url, cargoToml);
    }
    // crates.io checks the homepage the same way
    assert.doesNotMatch(generate(listUsers, { package: { homepage: 'example.com' } })('Cargo.toml'), /^homepage/m);
  });

  test("a crate name that isn't snake_case builds with warnings denied", () => {
    // rustc warns on a crate name with a capital or a double underscore inside
    for (const [name, crateName] of [
      ['MyClient', 'MyClient'],
      ['@acme/web--app', 'acme_web__app'],
    ]) {
      const read = generate(listUsers, { package: { name } });
      const source = read('src/lib.rs');

      assert.match(cargoPackageTable(read('Cargo.toml')), new RegExp(`^name = "${crateName}"$`, 'm'));
      assert.match(source.slice(0, source.indexOf('\nmod ')), /^#!\[allow\(non_snake_case\)\]/m, source);
    }
    // other crates keep the lint for the names they generate
    const source = generate(listUsers, { package: { name: '@acme/web-app' } })('src/lib.rs');

    assert.ok(!source.includes('#![allow(non_snake_case)]'), source);
  });

  test('the README headings name the functions the crate has', () => {
    const read = generate(
      userController({
        getUserByID: { httpMethod: 'GET', path: 'by-id', validation: {} },
        getUserById: { httpMethod: 'POST', path: 'by-id', validation: {} },
        httpRequest: { httpMethod: 'GET', path: 'request', validation: {} },
        type: { httpMethod: 'GET', path: 'type', validation: {} },
      })
    );
    const readme = read('README.md');
    const headings = [...readme.matchAll(/^### (.+)$/gm)].map(([, heading]) => heading);
    const functions = [...read('src/lib.rs').matchAll(/^ {4}pub async fn (\w+)\(/gm)].map(
      ([, name]) => `user_rpc::${name}`
    );

    assert.deepStrictEqual(headings, functions);
    assert.deepStrictEqual(headings, [
      'user_rpc::get_user_by_id',
      'user_rpc::get_user_by_id_2',
      'user_rpc::http_request_2',
      'user_rpc::type_',
    ]);
  });

  test("a segment's rootEntry of '' serves it from the root of the origin", () => {
    const file = generate(listUsers, { origin: 'https://example.com', segments: { '': { rootEntry: '' } } });

    assert.match(file('src/lib.rs'), /api_root: "https:\/\/example\.com",/);
  });

  test('the README shows readme.installCommand as written', () => {
    const installCommand = `cargo add app --git "https://x.test/a?b=1&c=2" --branch 'main' && echo <ok>`;
    const install = readmeInstallBlock(generate(listUsers, { readme: { installCommand } })('README.md'));

    assert.ok(install.startsWith(`# Install the package\n${installCommand}\n`), install);
  });

  test('the README URL of a mixin path keeps its trailing slash, as the client sends it', () => {
    const ok = { 200: { description: 'ok' } };
    const items = {
      openapi: '3.1.0',
      info: { title: 'Items', version: '1.0.0' },
      servers: [{ url: 'https://api.example.com/' }],
      paths: {
        '/': { get: { operationId: 'getRoot', responses: ok } },
        '/items/': { get: { operationId: 'listItems', responses: ok } },
        '/items/{id}/': {
          get: {
            operationId: 'getItem',
            parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
            responses: ok,
          },
        },
        '/plain': { get: { operationId: 'getPlain', responses: ok } },
      },
    };
    const read = generate(listUsers, {
      segments: { items: { openAPIMixin: { source: { object: items }, getModuleName: 'ItemsAPI' } } },
    });
    const readmeURLs = [...read('README.md').matchAll(/^`GET (https:.+)`$/gm)].map(([, url]) => url);
    const commentURLs = [...read('src/lib.rs').matchAll(/^ {4}\/\/ ItemsAPI\.\w+ GET `(.+)`$/gm)].map(([, url]) => url);

    assert.deepStrictEqual(readmeURLs, [
      'https://api.example.com/',
      'https://api.example.com/items/',
      'https://api.example.com/items/{id}/',
      'https://api.example.com/plain',
    ]);
    assert.deepStrictEqual(readmeURLs, commentURLs);
  });

  test('the README lists the function that sends the branches of a JSON-or-file body without a file as JSON', () => {
    const file = { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] };
    const data = { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] };
    const read = generate(
      userController({
        upload: {
          httpMethod: 'POST',
          path: 'upload',
          validation: { body: { anyOf: [data, file], 'x-contentType': ['application/json', 'multipart/form-data'] } },
        },
      })
    );
    const readme = read('README.md');
    const headings = [...readme.matchAll(/^### (.+)$/gm)].map(([, heading]) => heading);
    const functions = [...read('src/lib.rs').matchAll(/^ {4}pub async fn (\w+)\(/gm)].map(
      ([, name]) => `user_rpc::${name}`
    );
    // the sample under each heading
    const samples = Object.fromEntries(
      [...readme.matchAll(/^### (.+)$[\s\S]*?^```rust\n([\s\S]*?)^```$/gm)].map(([, heading, sample]) => [
        heading,
        sample,
      ])
    );

    assert.deepStrictEqual(headings, ['user_rpc::upload', 'user_rpc::upload_json']);
    assert.deepStrictEqual(headings, functions);
    assert.match(samples['user_rpc::upload'], /user_rpc::upload\(\n\s+form,/);
    assert.match(samples['user_rpc::upload_json'], /user_rpc::upload_json\(\n\s+from_value\(json!\(\{\n\s+"n": /);
  });

  test('the README starts with readme.banner', () => {
    const readme = generate(listUsers, { readme: { banner: 'Banner line' } })('README.md');
    const bannerAt = readme.indexOf('Banner line');

    assert.ok(bannerAt !== -1 && bannerAt < readme.indexOf('\n# '), readme);
  });
});
