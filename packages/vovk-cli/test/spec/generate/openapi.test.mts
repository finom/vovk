import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { Project, ts } from 'ts-morph';
import type { VovkSchema } from 'vovk';
import { HttpMethod } from 'vovk/internal';
import * as YAML from 'yaml';
import { importFresh } from '../../lib/import-fresh.mts';
import { createProject, runCLI, userSegmentSchema } from '../../lib/minimal-project.mts';
import { runScript } from '../../lib/run-script.mts';

const PORT = 3021;

const artifactsDir = path.join(path.resolve(import.meta.dirname, '../../..'), 'tmp_artifacts_dir');

function runAtProjectDir(command: string, options?: Omit<Parameters<typeof runScript>[1], 'cwd'>) {
  return runScript(command, { cwd: artifactsDir, ...options });
}

const getSpec = ({
  operationId = 'postTest',
  requestBodyContentType = 'application/json',
  responseContentType = 'application/json',
}: {
  operationId?: string | null;
  requestBodyContentType?: string;
  responseContentType?: string;
} = {}): OpenAPIObject => ({
  openapi: '3.1.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
  },
  servers: [{ url: 'https://example.com/api/v1' }],
  paths: {
    '/test': {
      post: {
        operationId: operationId ?? undefined,
        summary: 'Post test',
        description: 'Create a new test item',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'The ID of the test item',
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Search flag',
          },
        ],
        requestBody: {
          content: {
            [requestBodyContentType]: {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                  },
                },
                required: ['message'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              [responseContentType]: {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

const writeSpec = async (opts?: Parameters<typeof getSpec>[0], format?: 'json' | 'yaml', name = 'spec') => {
  const spec = getSpec(opts);
  const specStr = format === 'yaml' ? YAML.stringify(spec) : JSON.stringify(spec, null, 2);
  const specFileName = format === 'yaml' ? `${name}.yaml` : `${name}.json`;
  await fs.mkdir(artifactsDir, { recursive: true });
  const specPath = path.join(artifactsDir, specFileName);
  await fs.writeFile(specPath, specStr);
};

await describe('OpenAPI flags', async () => {
  await it('can generate from local openapi spec with default options', async () => {
    await writeSpec();
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema, api } = await import(path.join(generatedClientDir, 'index.ts'));
    const { openapi } = await import(path.join(generatedClientDir, 'openapi.ts'));
    const { schema: schema2 } = await import(path.join(generatedClientDir, 'schema.ts'));

    strictEqual(openapi.openapi, '3.1.0');
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.body.properties.message.type,
      'string'
    );
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.params.properties.id.type, 'string');
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.query.properties.search.type,
      'string'
    );
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.output.properties.success.type,
      'boolean'
    );
    ok(typeof api.postTest === 'function', 'api.postTest should be a function');
    strictEqual(schema.segments.mixin.forceApiRoot, 'https://example.com/api/v1');
    strictEqual(schema2.segments.mixin.forceApiRoot, 'https://example.com/api/v1');
    // await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('assigns x-contentType to multipart/form-data bodies', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);
    await writeSpec({
      requestBodyContentType: 'multipart/form-data',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema, api } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    deepStrictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.body['x-contentType'], [
      'multipart/form-data',
    ]);
    ok(typeof api.postTest === 'function', 'api.postTest should be a function');
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('assigns x-contentType to application/x-www-form-urlencoded bodies', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);
    await writeSpec({
      requestBodyContentType: 'application/x-www-form-urlencoded',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    deepStrictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.body['x-contentType'], [
      'application/x-www-form-urlencoded',
    ]);
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('creates iteration validation with content-type application/jsonl', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);
    await writeSpec({
      responseContentType: 'application/jsonl',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.output, undefined);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.iteration.properties.success.type,
      'boolean'
    );
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('creates iteration validation with content-type application/jsonlines', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);
    await writeSpec({
      responseContentType: 'application/jsonlines',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.output, undefined);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.iteration.properties.success.type,
      'boolean'
    );
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('generates handler name without operation id', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);
    await writeSpec({
      operationId: '',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from ts`);

    const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.createTest.httpMethod, HttpMethod.POST);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.createTest.validation.output.properties.success.type,
      'boolean'
    );
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('can accept custom module name and custom mixin name', async () => {
    await writeSpec();
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi spec.json --openapi-module-name MyRPC --openapi-mixin-name myMixin --out ${generatedClientDir} --from ts`
    );

    const { schema, MyRPC } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.myMixin.controllers.MyRPC.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest.validation.body.properties.message.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest.validation.params.properties.id.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest.validation.query.properties.search.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest.validation.output.properties.success.type,
      'boolean'
    );
    ok(typeof MyRPC.postTest === 'function', 'api.postTest should be a function');
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('can use JSON URL and write fallback', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    try {
      await writeSpec();

      await runAtProjectDir(
        `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.json --out ${generatedClientDir} --from ts --openapi-fallback fallback.json`
      );

      const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
      const fallback = JSON.parse(await fs.readFile(path.join(artifactsDir, 'fallback.json'), 'utf-8'));
      strictEqual(fallback.openapi, '3.1.0');
      strictEqual(fallback.paths['/test']?.post?.operationId, 'postTest');
    } catch (e) {
      await httpServer.kill();
      await fs.rm(generatedClientDir, { recursive: true });
      throw e;
    }

    await httpServer.kill();
    await fs.rm(generatedClientDir, { recursive: true });
  });

  await it('can use YAML URL and write fallback', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    try {
      await writeSpec({}, 'yaml');

      await runAtProjectDir(
        `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.yaml --out ${generatedClientDir} --from ts --openapi-fallback fallback.yaml`
      );

      const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
      const fallback = YAML.parse(await fs.readFile(path.join(artifactsDir, 'fallback.yaml'), 'utf-8'));
      strictEqual(fallback.openapi, '3.1.0');
      strictEqual(fallback.paths['/test']?.post?.operationId, 'postTest');
    } catch (e) {
      await httpServer.kill();
      await fs.rm(generatedClientDir, { recursive: true });
      throw e;
    }

    await httpServer.kill();
    await fs.rm(generatedClientDir, { recursive: true });
  });

  await it('can watch JSON file and regenerate on spec change', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    const watch = runAtProjectDir(
      `../dist/index.mjs generate --openapi ${artifactsDir}/spec.json --out ${generatedClientDir} --from ts --watch 1`
    );

    try {
      await writeSpec();

      await new Promise((resolve) => setTimeout(resolve, 4000));

      const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);

      await writeSpec({ operationId: 'postTest2' });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const { schema: schema2 } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);
      strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest2.httpMethod, HttpMethod.POST);
    } catch (e) {
      await watch.kill();
      await fs.rm(generatedClientDir, { recursive: true, force: true });
      throw e;
    }

    await watch.kill();
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('can watch JSON URL and regenerate on spec change', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    const watch = runAtProjectDir(
      `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.json --out ${generatedClientDir} --from ts --watch 1`
    );

    try {
      await writeSpec();

      await new Promise((resolve) => setTimeout(resolve, 4000));

      const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);

      await writeSpec({ operationId: 'postTest2' });
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const { schema: schema2 } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);
      strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest2.httpMethod, HttpMethod.POST);
    } catch (e) {
      await watch.kill();
      await httpServer.kill();

      await fs.rm(generatedClientDir, { recursive: true, force: true });
      throw e;
    }

    await watch.kill();
    await httpServer.kill();

    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('can watch YAML file and regenerate on spec change', async () => {
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    const watch = runAtProjectDir(
      `../dist/index.mjs generate --openapi ${artifactsDir}/spec.yaml --out ${generatedClientDir} --from ts --watch 1`
    );

    try {
      await writeSpec({}, 'yaml');

      await new Promise((resolve) => setTimeout(resolve, 4000));

      const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);

      await writeSpec({ operationId: 'postTest2' }, 'yaml');
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const { schema: schema2 } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);
      strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest2.httpMethod, HttpMethod.POST);
    } catch (e) {
      await watch.kill();
      await fs.rm(generatedClientDir, { recursive: true, force: true });
      throw e;
    }

    await watch.kill();
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('can watch YAML URL and regenerate on spec change', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    const watch = runAtProjectDir(
      `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.yaml --out ${generatedClientDir} --from ts --watch 1`
    );

    try {
      await writeSpec({}, 'yaml');

      await new Promise((resolve) => setTimeout(resolve, 4000));

      const { schema } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);

      await writeSpec({ operationId: 'postTest2' }, 'yaml');
      await new Promise((resolve) => setTimeout(resolve, 4000));
      const { schema: schema2 } = await importFresh<{ schema: VovkSchema }>(path.join(generatedClientDir, 'index.ts'), [
        'schema',
      ]);
      strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest2.httpMethod, HttpMethod.POST);
    } catch (e) {
      await watch.kill();
      await httpServer.kill();

      await fs.rm(generatedClientDir, { recursive: true, force: true });
      throw e;
    }

    await watch.kill();
    await httpServer.kill();

    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('defines --openapi-root-url flag to override server url', async () => {
    await writeSpec();
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi spec.json --openapi-root-url https://api.example.com/v1 --out ${generatedClientDir} --from ts`
    );

    const { schema } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin.forceApiRoot, 'https://api.example.com/v1');

    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('uses multiple --openapi flags in row', async () => {
    await writeSpec(
      {
        operationId: 'postTest1',
      },
      'json',
      'spec1'
    );
    await writeSpec(
      {
        operationId: 'postTest2',
      },
      'yaml',
      'spec2'
    );
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi ${artifactsDir}/spec1.json --openapi spec2.yaml --openapi-module-name RPC1 --openapi-get-module-name RPC2 --openapi-mixin-name mixin1 --openapi-mixin-name mixin2 --out ${generatedClientDir} --from ts`
    );

    const { schema, RPC1, RPC2 } = await import(path.join(generatedClientDir, 'index.ts'));

    strictEqual(schema.segments.mixin1.controllers.RPC1.handlers.postTest1.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin2.controllers.RPC2.handlers.postTest2.httpMethod, HttpMethod.POST);
    ok(typeof RPC1.postTest1 === 'function', 'RPC1.postTest1 should be a function');
    ok(typeof RPC2.postTest2 === 'function', 'RPC2.postTest2 should be a function');
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });
});

// the diagnostics of the files in dir; declaration files are checked too, so an unresolved type can't turn into any
function typecheck(rootFile: string, dir: string) {
  const project = new Project({
    compilerOptions: {
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      target: ts.ScriptTarget.ES2022,
      lib: ['lib.esnext.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      types: ['node'],
    },
  });
  project.addSourceFileAtPath(rootFile);
  project.resolveSourceFileDependencies();
  return project
    .getPreEmitDiagnostics()
    .map(({ compilerObject: { file, messageText } }) => ({ file: file?.fileName ?? '', messageText }))
    .filter(({ file }) => file.startsWith(dir))
    .map(
      ({ file, messageText }) => `${path.relative(dir, file)}: ${ts.flattenDiagnosticMessageText(messageText, '\n')}`
    );
}

await describe('Generated mixin client', async () => {
  await it('typechecks with skipLibCheck false', async () => {
    const spec: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Events', version: '1.0.0' },
      servers: [{ url: 'https://example.com/api' }],
      paths: {
        '/events': {
          get: {
            operationId: 'streamEvents',
            responses: {
              '200': {
                description: 'ok',
                content: { 'application/jsonl': { schema: { $ref: '#/components/schemas/Event' } } },
              },
            },
          },
        },
        '/thing': {
          get: {
            operationId: 'getThing',
            responses: {
              '200': { description: 'ok', content: { 'application/json': { schema: { type: 'object' } } } },
            },
          },
        },
      },
      components: {
        schemas: { Event: { type: 'object', properties: { n: { type: 'number' } }, required: ['n'] } },
      },
    };
    await fs.mkdir(artifactsDir, { recursive: true });
    await fs.writeFile(path.join(artifactsDir, 'typed-spec.json'), JSON.stringify(spec));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(`../dist/index.mjs generate --openapi typed-spec.json --out ${generatedClientDir} --from ts`);

    const consumer = path.join(generatedClientDir, 'consumer.ts');
    await fs.writeFile(
      consumer,
      `import { api, type Mixins } from './index.ts';
type IsAny<T> = 0 extends 1 & T ? true : false;
export async function check() {
  await api.getThing();
  for await (const event of await api.streamEvents()) {
    const typed: IsAny<typeof event> = false;
    const n: number = event.n;
    const declared: Mixins.Mixin.Event = event;
    return [typed, n, declared];
  }
}
`
    );

    deepStrictEqual(typecheck(consumer, generatedClientDir), []);
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });

  await it('declares every Mixins type its methods refer to, whatever the names', async () => {
    const names = ['Grüße', '用户', '1st', 'ABC1', 'user-profile', 'UserProfile', 'Pet', 'pet'];
    const spec: OpenAPIObject = {
      openapi: '3.1.0',
      info: { title: 'Names', version: '1.0.0' },
      servers: [{ url: 'https://example.com/api' }],
      paths: {
        '/2fa': {
          post: {
            operationId: '2fa_verify',
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/pet' } } } },
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: Object.fromEntries(
                        names.map((name, i) => [`p${i}`, { $ref: `#/components/schemas/${name}` }])
                      ),
                      required: names.map((_, i) => `p${i}`),
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: Object.fromEntries(
          names.map((name, i) => [name, { type: 'object', properties: { [`n${i}`]: { type: 'number' } } }])
        ),
      },
    };
    await fs.mkdir(artifactsDir, { recursive: true });
    await fs.writeFile(path.join(artifactsDir, 'named-spec.json'), JSON.stringify(spec));
    const generatedClientDir = path.join(artifactsDir, `generated-client${Date.now()}`);

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi named-spec.json --openapi-mixin-name café-api --openapi-module-name NamesAPI --openapi-get-method-name camel-case-operation-id --out ${generatedClientDir} --from ts`
    );

    const consumer = path.join(generatedClientDir, 'consumer.ts');
    await fs.writeFile(
      consumer,
      `import { NamesAPI } from './index.ts';
type IsAny<T> = 0 extends 1 & T ? true : false;
export async function check() {
  const output = await NamesAPI._2FaVerify({ body: {} });
  const typed: false[] = [${names.map((_, i) => `false as IsAny<typeof output.p${i}>`).join(', ')}];
  return typed;
}
`
    );

    deepStrictEqual(typecheck(consumer, generatedClientDir), []);
    await fs.rm(generatedClientDir, { recursive: true, force: true });
  });
});

await describe('Mixin and module names', async () => {
  const projectDir = path.join(path.resolve(import.meta.dirname, '../../..'), 'tmp_openapi_names');
  const segment = (segmentName: string, rpcModuleName: string) => ({
    ...userSegmentSchema,
    segmentName,
    controllers: { [rpcModuleName]: { ...userSegmentSchema.controllers.UserRPC, rpcModuleName } },
  });
  const project = (files: Record<string, string | object> = {}) =>
    createProject(projectDir, {
      'package.json': { name: 'app', version: '1.0.0', type: 'module' },
      'vovk.config.mjs': 'export default { composedClient: { prettifyClient: false } };',
      'spec.json': getSpec(),
      '.vovk-schema/root.json': segment('', 'UserRPC'),
      ...files,
    });
  const generate = (args: string[]) => runCLI(['generate', ...args], { cwd: projectDir });
  const failure = async (args: string[]) => {
    const error = await generate(args).then(
      () => null,
      (e: { stderr: string; stdout: string }) => e
    );
    ok(error, `generate ${args.join(' ')} succeeded`);
    return `${error.stdout}${error.stderr}`;
  };

  await it('refuses a mixin named root, in any case', async () => {
    await project();
    for (const name of ['root', 'Root']) {
      const output = await failure(['--openapi', 'spec.json', '--openapi-mixin-name', name]);
      ok(output.includes(`Mixin "${name}"`), output);
    }
  });

  await it('refuses a mixin named like a segment', async () => {
    await project({ '.vovk-schema/foo.json': segment('foo', 'FooRPC') });
    const output = await failure(['--openapi', 'spec.json', '--openapi-mixin-name', 'Foo']);
    ok(output.includes('segment "foo"'), output);
  });

  await it('refuses two mixins with one name', async () => {
    await project({
      'vovk.config.mjs': `export default { outputConfig: { segments: { petstore: { openAPIMixin: { source: { file: './spec.json' }, getModuleName: 'PetstoreAPI' } } } } };`,
    });
    const output = await failure(['--openapi', 'spec.json', '--openapi-mixin-name', 'petstore']);
    ok(output.includes('mixin "petstore"'), output);
  });

  await it('refuses two mixins whose types share a namespace', async () => {
    await project();
    const output = await failure([
      ...['--openapi', 'spec.json', '--openapi', 'spec.json'],
      ...['--openapi-mixin-name', 'my-api', '--openapi-mixin-name', 'myApi'],
    ]);
    ok(output.includes('Mixins.MyApi'), output);
  });

  await it('refuses a mixin module name that is not an identifier', async () => {
    await project();
    const output = await failure(['--openapi', 'spec.json', '--openapi-module-name', 'my-api']);
    ok(output.includes('"my-api"'), output);
  });

  await it('refuses two segments that give the composed client one module name', async () => {
    await project({ '.vovk-schema/tenant.json': segment('tenant', 'UserRPC') });
    const output = await failure([]);
    ok(output.includes('UserRPC'), output);
    // a segmented client keeps each segment in its own folder
    await generate(['--segmented-only']);
  });

  await it('names the module of a CLI mixin after it', async () => {
    await project();
    await generate([
      ...['--openapi', 'spec.json', '--openapi', 'spec.json', '--openapi', 'spec.json', '--openapi', 'spec.json'],
      ...['--openapi-mixin-name', 'petstore', '--openapi-mixin-name', 'my-store'],
    ]);
    const { schema } = await import(path.join(projectDir, 'client/schema.ts'));
    deepStrictEqual(
      ['petstore', 'my-store', 'mixin3', 'mixin4'].map((mixinName) =>
        Object.keys(schema.segments[mixinName].controllers)
      ),
      [['petstore'], ['myStore'], ['api3'], ['api4']]
    );
    await fs.rm(projectDir, { recursive: true, force: true });
  });
});
