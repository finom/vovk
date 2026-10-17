import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import type { VovkSchema } from 'vovk';
import { type VovkStrictConfig, vovkSchemaToOpenAPI } from 'vovk/internal';

const cliPath = path.join(import.meta.dirname, '../../vovk-cli/dist/index.mjs');
const hasPython = spawnSync('python3', ['--version']).status === 0;
// the generated package imports them
const hasClientDeps = hasPython && spawnSync('python3', ['-c', 'import requests, jsonschema']).status === 0;
const projectDirs: string[] = [];

after(() => {
  for (const dir of projectDirs) fs.rmSync(dir, { recursive: true, force: true });
});

// generates the py client of a project with a segment per entry of these controllers into dist_python
function generateSegments(segments: Record<string, Record<string, unknown>>, outputConfig: object = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vovk-python-'));
  projectDirs.push(dir);
  const config = { composedClient: { fromTemplates: ['py'], prettifyClient: false }, outputConfig };
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
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', version: '1.0.0' }));
  fs.writeFileSync(path.join(dir, 'vovk.config.mjs'), `export default ${JSON.stringify(config)};`);
  execFileSync(process.execPath, [cliPath, 'generate'], { cwd: dir, stdio: 'pipe' });
  return (file: string) => path.join(dir, 'dist_python', file);
}

// the same, with one segment
const generate = (controllers: Record<string, unknown>, outputConfig: object = {}) =>
  generateSegments({ '': controllers }, outputConfig);

// what test_py's test_every_annotation_resolves checks, on a generated package: the annotations of every class and
// method of every RPC class resolve; the runtime is left out, as the annotations don't need it
function annotationProblems(file: (file: string) => string, packageName = 'app') {
  const script = `
import importlib, inspect, sys, types, typing
sys.path.insert(0, sys.argv[1])
stub = types.ModuleType(sys.argv[2] + '.api_client')
stub.ApiClient = lambda *args: None
stub.HttpException = Exception
sys.modules[stub.__name__] = stub
package = importlib.import_module(sys.argv[2])
for rpc in [value for value in vars(package).values() if isinstance(value, type) and value.__module__ == package.__name__]:
    for name, value in vars(rpc).items():
        target = value.__func__ if isinstance(value, staticmethod) else value
        if (name.startswith('__') and name.endswith('__')) or not (isinstance(target, type) or inspect.isroutine(target)):
            continue
        try:
            typing.get_type_hints(target, localns=dict(vars(rpc)))
        except Exception as error:
            print(f'{rpc.__name__}.{name}: {type(error).__name__}: {error}')
`;
  const result = spawnSync('python3', ['-c', script, file('src'), packageName], { encoding: 'utf-8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
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

test('a handler name that starts with an underscore or a dollar', { skip: !hasPython && 'python3 not found' }, () => {
  // Python mangles a __name inside a class body, so a nested class named so can't be found by its annotation
  const nested = {
    type: 'object',
    properties: { profile: { type: 'object', properties: { name: { type: 'string' } } } },
    required: ['profile'],
  };
  const file = generate({
    UserRPC: controller('User', {
      _internal: { httpMethod: 'POST', path: 'internal', validation: { body: nested, output: nested } },
      $dollar: { httpMethod: 'GET', path: 'dollar', validation: { query: nested } },
    }),
  });
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');

  assert.equal(annotationProblems(file), '');
  assert.doesNotMatch(source, /class __|UserRPC\.__/);
});

// an OpenAPI document with a write-only property and an object that may be null
const users = {
  openapi: '3.1.0',
  info: { title: 'Users', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com' }],
  paths: {
    '/users': {
      post: {
        operationId: 'createUser',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
        },
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
        },
      },
    },
    '/me': {
      get: {
        operationId: 'getMe',
        responses: {
          200: {
            description: 'ok',
            content: {
              'application/json': {
                schema: { type: ['object', 'null'], properties: { name: { type: 'string' } }, required: ['name'] },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'name', 'password'],
        properties: {
          id: { type: 'string', readOnly: true },
          name: { type: 'string' },
          password: { type: 'string', writeOnly: true },
        },
      },
    },
  },
};

test('the types of an OpenAPI mixin', { skip: !hasPython && 'python3 not found' }, async (t) => {
  const file = generate(
    { UserRPC: controller('User', { list: { httpMethod: 'GET', path: '', validation: {} } }) },
    { segments: { users: { openAPIMixin: { source: { object: users }, getModuleName: 'UsersAPI' } } } }
  );
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  // the lines of a class, up to the next declaration
  const classBody = (name: string) => source.match(new RegExp(`class ${name}\\(TypedDict\\):\\n((?: {8}.*\\n)*)`))?.[1];

  await t.test('a write-only property may be missing from a response, as a server never sends it', () => {
    assert.match(classBody('_CreateUserOutput_User') ?? '', /^ {8}password: NotRequired\[str\]$/m, source);
    assert.match(classBody('_CreateUserBody_User') ?? '', /^ {8}password: str$/m, source);
  });

  await t.test('an object that may be null is declared once', () => {
    assert.equal(source.match(/^ {4}(class )?GetMeOutput\b/gm)?.length, 1, source);
    assert.match(source, /^ {4}GetMeOutput: TypeAlias = Union\[_GetMeOutput_object, None\]$/m);
  });

  await t.test('every annotation resolves', () => {
    assert.equal(annotationProblems(file), '');
  });
});

test('the files a multipart procedure takes', { skip: !hasPython && 'python3 not found' }, () => {
  const file = { type: 'string', format: 'binary' };
  const multipart = (properties: Record<string, unknown>) => ({
    type: 'object',
    properties,
    'x-contentType': ['multipart/form-data'],
  });
  const generated = generate({
    UserRPC: controller('User', {
      uploadImages: {
        httpMethod: 'POST',
        path: 'images',
        validation: { body: multipart({ avatar: file, cover: file }) },
      },
      uploadMany: {
        httpMethod: 'POST',
        path: 'many',
        validation: { body: multipart({ files: { type: 'array', items: file } }) },
      },
      uploadAvatar: { httpMethod: 'POST', path: 'avatar', validation: { body: multipart({ avatar: file }) } },
    }),
  });
  const source = fs.readFileSync(generated('src/app/__init__.py'), 'utf-8');
  const fileValue =
    'Union[BinaryIO, Tuple[str, BinaryIO], Tuple[str, BinaryIO, str], Tuple[str, BinaryIO, str, Dict[str, str]]]';

  // several single files: a dict, as requests takes one, or (field name, file) pairs; a pair holds a file or a tuple
  assert.ok(
    source.includes(`files: Union[UploadImagesFiles, Dict[str, ${fileValue}], Sequence[Tuple[str, ${fileValue}]]],`),
    source
  );
  // a dict holds one file for a field, and a list of files needs one pair per file
  assert.ok(source.includes(`files: Union[UploadManyFiles, Sequence[Tuple[str, ${fileValue}]]],`), source);
  assert.ok(source.includes('files: UploadAvatarFiles,'), source);
  // the aliases stay as they were, so a list annotated with one still takes append
  assert.match(source, /^ {4}UploadImagesFiles = List\[Tuple\[str, Union\[Tuple\[str, BinaryIO\], /m);
  assert.equal(annotationProblems(generated), '');
});

test('a body the server reads as text takes a str', { skip: !hasPython && 'python3 not found' }, () => {
  const body = (schema: Record<string, unknown>) => ({ httpMethod: 'POST', path: '', validation: { body: schema } });
  const file = generate({
    UserRPC: controller('User', {
      postXml: body({ 'x-contentType': ['application/xml'] }),
      postLines: body({ type: 'string', 'x-contentType': ['application/jsonl'] }),
      postAtom: body({ type: 'string', 'x-contentType': ['application/atom+xml'] }),
      postBytes: body({ type: 'string', 'x-contentType': ['application/octet-stream'] }),
      postImage: body({ type: 'string', 'x-contentType': ['image/png'] }),
      postXmlFile: body({ type: 'string', format: 'binary', 'x-contentType': ['application/xml'] }),
    }),
  });
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  const bodyTypes = Object.fromEntries(
    [...source.matchAll(/^ {4}def (\w+)\(\n {8}body: (.+),$/gm)].map(([, name, type]) => [name, type])
  );

  assert.deepEqual(bodyTypes, {
    post_xml: 'Union[str, bytes]',
    post_lines: 'Union[str, bytes]',
    post_atom: 'Union[str, bytes]',
    post_bytes: 'bytes',
    post_image: 'bytes',
    post_xml_file: 'bytes',
  });
  assert.equal(annotationProblems(file), '');
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

test("a segment's rootEntry of '' serves it from the root of the origin", () => {
  const file = generate(
    { UserRPC: controller('User', { list: { httpMethod: 'GET', path: '', validation: {} } }) },
    { origin: 'https://example.com', segments: { '': { rootEntry: '' } } }
  );
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');

  assert.match(source, /^ {4}"": \("https:\/\/example\.com", ""\),$/m);
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

// checks every sample of the README with test_py/readme_check.py; argv: test_py, the package's src, the README
const checkReadme = `import sys
sys.path[:0] = sys.argv[1:3]
from readme_check import check_readme
import app
problems = check_readme(open(sys.argv[3], encoding='utf-8').read(), app)
print('\\n'.join(problems))
sys.exit(1 if problems else 0)`;

test('every README sample calls its method with the arguments it takes', {
  skip: !hasClientDeps && 'python3 with requests and jsonschema not found',
}, () => {
  const file = { type: 'string', format: 'binary' };
  const multipart = (properties: Record<string, unknown>) => ({
    type: 'object',
    properties,
    required: Object.keys(properties),
    'x-contentType': ['multipart/form-data'],
  });
  const post = (body: unknown) => ({ httpMethod: 'POST', path: '', validation: { body } });
  const generated = generate({
    FileRPC: controller('File', {
      // files alone: the method takes no body
      upload: post(multipart({ file })),
      uploadMany: post(multipart({ files: { type: 'array', items: file } })),
      attach: post(multipart({ note: { type: 'string' }, file })),
      raw: post({ ...file, 'x-contentType': ['application/octet-stream'] }),
      untypedRaw: post({ 'x-contentType': ['image/png'] }),
      note: post({ 'x-contentType': ['text/plain'] }),
      fileOrData: post({
        anyOf: [file, { type: 'object', properties: { hello: { type: 'string' } }, required: ['hello'] }],
        'x-contentType': ['image/png', 'application/json'],
      }),
      // no params schema: the path's placeholders are the params
      getItem: { httpMethod: 'GET', path: 'items/{id}', validation: {} },
      pair: post({
        type: 'object',
        properties: { t: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }], items: false } },
        required: ['t'],
      }),
      extended: post({
        type: 'object',
        properties: {
          s: {
            allOf: [
              { $ref: '#/$defs/named' },
              { type: 'object', properties: { extra: { type: 'number' } }, required: ['extra'] },
            ],
          },
        },
        required: ['s'],
        $defs: { named: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
      }),
    }),
  });

  const result = spawnSync(
    'python3',
    ['-c', checkReadme, path.join(import.meta.dirname, '../test_py'), generated('src'), generated('README.md')],
    { encoding: 'utf-8' }
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('a mixin path keeps its trailing slash in the comments and the README', () => {
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
  const file = generate(
    {},
    { segments: { items: { openAPIMixin: { source: { object: items }, getModuleName: 'ItemsAPI' } } } }
  );
  const readme = fs.readFileSync(file('README.md'), 'utf-8');
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  // as the client sends them
  const expected = [
    'https://api.example.com/',
    'https://api.example.com/items/',
    'https://api.example.com/items/{id}/',
    'https://api.example.com/plain',
  ];

  assert.deepEqual(
    [...readme.matchAll(/^`GET (.+)`$/gm)].map(([, url]) => url),
    expected
  );
  assert.deepEqual(
    [...source.matchAll(/^ {4}# ItemsAPI\.\w+ GET `(.+)`$/gm)].map(([, url]) => url),
    expected
  );
});

// RPC modules whose names are one Python identifier: User$RPC and User_RPC are both User_RPC; "client" is the
// package's ApiClient
const alikeModules = () => {
  const list = (validation = {}) => ({ httpMethod: 'GET', path: '', validation, operationObject: { summary: 'list' } });
  const named = (rpcModuleName: string, handlers: Record<string, unknown>) => ({
    [rpcModuleName]: { ...controller('Thing', handlers), rpcModuleName, prefix: rpcModuleName.replace('$', '') },
  });
  return {
    '': { ...named('User$RPC', { list: list() }), ...named('client', { list: list() }) },
    other: named('User_RPC', { list: list({ query: idSchema }) }),
  };
};

test('RPC modules alike as Python identifiers get a class each across segments', {
  skip: !hasPython && 'python3 not found',
}, () => {
  const file = generateSegments(alikeModules());
  const source = fs.readFileSync(file('src/app/__init__.py'), 'utf-8');
  const readme = fs.readFileSync(file('README.md'), 'utf-8');
  // each class and the RPC module its method calls
  const classes = [...source.matchAll(/^class (\w+): *\n[\s\S]*?rpc_name="([^"]+)"/gm)].map(([, name, rpcName]) => [
    name,
    rpcName,
  ]);

  // a second class of a name replaced the first, so the last module of a name keeps it; a class named client would
  // replace the ApiClient every method calls
  assert.deepEqual(classes, [
    ['User_RPC_2', 'User$RPC'],
    ['client_2', 'client'],
    ['User_RPC', 'User_RPC'],
  ]);
  assert.deepEqual(
    [...readme.matchAll(/^## (\w+)$/gm)].map(([, name]) => name),
    ['User_RPC_2', 'client_2', 'User_RPC']
  );
  assert.match(readme, /^from app import User_RPC_2$/m);
  assert.match(readme, /^response = User_RPC_2\.list\(/m);
  assert.match(readme, /^response = client_2\.list\(/m);
  assert.equal(annotationProblems(file), '');
});

test('the OpenAPI samples name the classes the package has', () => {
  const segments = alikeModules();
  const source = fs.readFileSync(generateSegments(segments)('src/app/__init__.py'), 'utf-8');
  const schema = {
    $schema: 'https://vovk.dev/api/schema/v3/schema.json',
    segments: Object.fromEntries(
      Object.entries(segments).map(([segmentName, controllers]) => [
        segmentName,
        { $schema: '', emitSchema: true, segmentName, segmentType: 'segment', controllers },
      ])
    ),
  } as unknown as VovkSchema;
  const { paths } = vovkSchemaToOpenAPI({
    config: { outputConfig: { samples: {} } } as unknown as VovkStrictConfig,
    schema,
    outputConfigs: [],
    isBundle: false,
    segmentName: null,
    projectPackageJson: { name: 'app' },
  }).openAPIObject;
  const sampleClasses = Object.values(paths ?? {}).map((item) => {
    const samples: { lang: string; source: string }[] = item.get?.['x-codeSamples'] ?? [];
    return samples.find(({ lang }) => lang === 'python')?.source.match(/^response = (\w+)\.list\(/m)?.[1];
  });

  assert.deepEqual(
    sampleClasses,
    [...source.matchAll(/^class (\w+):/gm)].map(([, name]) => name)
  );
});
