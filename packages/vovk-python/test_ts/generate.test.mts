import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

const cliPath = path.join(import.meta.dirname, '../../vovk-cli/dist/index.mjs');
const hasPython = spawnSync('python3', ['--version']).status === 0;
const projectDirs: string[] = [];

after(() => {
  for (const dir of projectDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// generates the py client of a project with one segment of these controllers into dist_python
function generate(controllers: Record<string, unknown>, outputConfig: object = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-python-'));
  projectDirs.push(dir);
  const segment = {
    $schema: 'https://vovk.dev/api/schema/v3/segment.json',
    emitSchema: true,
    segmentName: '',
    segmentType: 'segment',
    controllers,
  };
  const config = { composedClient: { fromTemplates: ['py'], prettifyClient: false }, outputConfig };
  fs.mkdirSync(path.join(dir, '.vovk-schema'));
  fs.writeFileSync(path.join(dir, '.vovk-schema/root.json'), JSON.stringify(segment));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return (file: string) => path.join(dir, 'dist_python', file);
}

const controller = (name: string, handlers: Record<string, unknown>) => ({
  rpcModuleName: `${name}RPC`,
  originalControllerName: `${name}Controller`,
  prefix: name.toLowerCase(),
  handlers,
});

const idSchema = { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] };

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

test('a controller without handlers', { skip: !hasPython && 'python3 not found' }, () => {
  // as `vovk new controller post --empty` leaves it
  const file = generate({
    UserRPC: controller('User', { list: { httpMethod: 'GET', path: '', validation: {} } }),
    PostRPC: controller('Post', {}),
  });

  const result = spawnSync(
    'python3',
    [
      '-c',
      'import ast, sys; ast.parse(open(sys.argv[1], encoding="utf-8").read(), sys.argv[1])',
      file('src/app/__init__.py'),
    ],
    { encoding: 'utf-8' }
  );
  assert.equal(result.status, 0, result.stderr);
});

test('a body that may hold a file takes files after the arguments every call needs', {
  skip: !hasPython && 'python3 not found',
}, () => {
  const file = generate({
    UserRPC: controller('User', {
      upload: {
        httpMethod: 'POST',
        path: '{id}',
        validation: {
          body: {
            anyOf: [
              { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] },
              { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] },
            ],
            'x-contentType': ['application/json', 'multipart/form-data'],
          },
          query: idSchema,
          params: idSchema,
        },
      },
    }),
  });
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  const result = spawnSync(
    'python3',
    [
      '-c',
      'import ast, sys; ast.parse(open(sys.argv[1], encoding="utf-8").read(), sys.argv[1])',
      file('src/app/__init__.py'),
    ],
    { encoding: 'utf-8' }
  );

  // an argument without a default after one with a default is a SyntaxError
  assert.equal(result.status, 0, result.stderr);
  assert.match(
    source,
    /body: UploadBody,\n +query: UploadQuery,\n +params: UploadParams,\n +files: Optional\[UploadFiles\] = None,/
  );
  assert.match(source, /^ {12}files=files,$/m);
});

test('a title or description that is not a string', { skip: !hasPython && 'python3 not found' }, () => {
  const file = generate(
    { UserRPC: controller('User', { list: { httpMethod: 'GET', path: '', validation: {} } }) },
    { segments: { things: { openAPIMixin: { source: { object: numericTexts }, getModuleName: 'ThingsAPI' } } } }
  );

  const result = spawnSync(
    'python3',
    [
      '-c',
      'import ast, sys; ast.parse(open(sys.argv[1], encoding="utf-8").read(), sys.argv[1])',
      file('src/app/__init__.py'),
    ],
    { encoding: 'utf-8' }
  );
  assert.equal(result.status, 0, result.stderr);
});

test('handler names that are alike in snake_case get a method each', () => {
  const file = generate({
    UserRPC: controller('User', {
      getUserByID: { httpMethod: 'GET', path: 'by-id', validation: { query: idSchema } },
      getUserById: { httpMethod: 'POST', path: 'by-id', validation: { body: idSchema } },
    }),
  });
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  const methods = [...source.matchAll(/^ {4}def (\w+)\(/gm)].map(([, name]) => name);
  const handlers = [...source.matchAll(/handler_name="(\w+)"/g)].map(([, name]) => name);

  // a second def of a name replaces the first in the class
  assert.equal(methods.length, new Set(methods).size, `methods: ${methods.join(', ')}`);
  assert.deepEqual(handlers.toSorted(), ['getUserByID', 'getUserById']);
});

test('the README headings name the methods the package has', () => {
  const file = generate({
    UserRPC: controller('User', {
      getUserByID: { httpMethod: 'GET', path: 'by-id', validation: { query: idSchema } },
      getUserById: { httpMethod: 'POST', path: 'by-id', validation: { body: idSchema } },
      import: { httpMethod: 'POST', path: 'import', validation: {} },
    }),
  });
  const readme = fs.readFileSync(file('README.md'), 'utf-8');
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  const headings = [...readme.matchAll(/^### (.+)$/gm)].map(([, heading]) => heading);
  const methods = [...source.matchAll(/^ {4}def (\w+)\(/gm)].map(([, name]) => `UserRPC.${name}`);

  assert.deepEqual(headings, methods);
  assert.deepEqual(headings, ['UserRPC.get_user_by_id', 'UserRPC.get_user_by_id_2', 'UserRPC.import_']);
});

test('the README starts with readme.banner', () => {
  const file = generate(
    { UserRPC: controller('User', { list: { httpMethod: 'GET', path: '', validation: {} } }) },
    { readme: { banner: 'Banner line' } }
  );
  const readme = fs.readFileSync(file('README.md'), 'utf-8');
  const bannerAt = readme.indexOf('Banner line');

  assert.ok(bannerAt !== -1 && bannerAt < readme.indexOf('\n# '), readme);
});
