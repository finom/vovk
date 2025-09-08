import { it, describe } from 'node:test';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import fs from 'node:fs/promises';
import path from 'node:path';
import { runScript } from '../../lib/runScript.mts';
import { ok, strictEqual } from 'node:assert';
import { HttpMethod } from 'vovk';
import * as YAML from 'yaml';

const PORT = 3020;

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

const writeSpec = async (opts?: Parameters<typeof getSpec>[0], format?: 'json' | 'yaml') => {
  const spec = getSpec(opts);
  const specStr = format === 'yaml' ? YAML.stringify(spec) : JSON.stringify(spec, null, 2);
  const specFileName = format === 'yaml' ? 'spec.yaml' : 'spec.json';
  await fs.mkdir(artifactsDir, { recursive: true });
  const specPath = path.join(artifactsDir, specFileName);
  await fs.writeFile(specPath, specStr);
};

await describe.only('OpenAPI flags', async () => {
  await it('can generate from local openapi spec with default options', async () => {
    await writeSpec();
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { openapi, schema, api } = await import(path.join(generatedClientDir, 'index.mjs'));
    const { openapi: openapi2 } = await import(path.join(generatedClientDir, 'openapi.cjs'));
    const { schema: schema2 } = await import(path.join(generatedClientDir, 'schema.cjs'));

    strictEqual(openapi.openapi, '3.1.0');
    strictEqual(openapi2.openapi, '3.1.0');
    strictEqual(openapi.paths['/test']?.post?.operationId, 'postTest');
    strictEqual(openapi2.paths['/test']?.post?.operationId, 'postTest');
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
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('assigns x-isForm to multipart/form-data bodies', async () => {
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());
    await writeSpec({
      requestBodyContentType: 'multipart/form-data',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { schema, api } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.body['x-isForm'], true);
    ok(typeof api.postTest === 'function', 'api.postTest should be a function');
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('assigns x-isForm to application/x-www-form-urlencoded bodies', async () => {
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());
    await writeSpec({
      requestBodyContentType: 'application/x-www-form-urlencoded',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.body['x-isForm'], true);
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('creates iteration validation with content-type application/jsonl', async () => {
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());
    await writeSpec({
      responseContentType: 'application/jsonl',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.output, undefined);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.iteration.properties.success.type,
      'boolean'
    );
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('creates iteration validation with content-type application/jsonlines', async () => {
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());
    await writeSpec({
      responseContentType: 'application/jsonlines',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
    strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.validation.output, undefined);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.postTest.validation.iteration.properties.success.type,
      'boolean'
    );
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('generates handler name without operation id', async () => {
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());
    await writeSpec({
      operationId: '',
    });
    await runAtProjectDir(`../dist/index.mjs generate --openapi spec.json --out ${generatedClientDir} --from mjs`);

    const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.mixin.controllers.api.handlers.createByTest.httpMethod, HttpMethod.POST);
    strictEqual(
      schema.segments.mixin.controllers.api.handlers.createByTest.validation.output.properties.success.type,
      'boolean'
    );
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('can accept custom module name and custom mixin name', async () => {
    await writeSpec();
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi spec.json --openapi-module-name MyRPC --openapi-mixin-name myMixin --out ${generatedClientDir} --from mjs`
    );

    const { schema, MyRPC } = await import(path.join(generatedClientDir, 'index.mjs'));

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
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('works with nextjs-operation-id', async () => {
    await writeSpec({
      operationId: 'MyController_postTest2',
    });
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    await runAtProjectDir(
      `../dist/index.mjs generate --openapi spec.json --openapi-module-name nestjs-operation-id --openapi-method-name nestjs-operation-id --openapi-mixin-name myMixin --out ${generatedClientDir} --from mjs`
    );

    const { schema, MyRPC } = await import(path.join(generatedClientDir, 'index.mjs'));

    strictEqual(schema.segments.myMixin.controllers.MyRPC.handlers.postTest2.httpMethod, HttpMethod.POST);
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest2.validation.body.properties.message.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest2.validation.params.properties.id.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest2.validation.query.properties.search.type,
      'string'
    );
    strictEqual(
      schema.segments.myMixin.controllers.MyRPC.handlers.postTest2.validation.output.properties.success.type,
      'boolean'
    );
    ok(typeof MyRPC.postTest2 === 'function', 'api.postTest2 should be a function');
    await fs.rmdir(generatedClientDir, { recursive: true });
  });

  await it('can use JSON URL and write fallback', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    try {
      await writeSpec();

      await runAtProjectDir(
        `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.json --out ${generatedClientDir} --from mjs --openapi-fallback fallback.json`
      );

      const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
      const fallback = JSON.parse(await fs.readFile(path.join(artifactsDir, 'fallback.json'), 'utf-8'));
      strictEqual(fallback.openapi, '3.1.0');
      strictEqual(fallback.paths['/test']?.post?.operationId, 'postTest');
    } catch (e) {
      httpServer.kill();
      await fs.rm(generatedClientDir, { recursive: true });
      throw e;
    }

    httpServer.kill();
    await fs.rm(generatedClientDir, { recursive: true });
  });

  await it('can use YAML URL and write fallback', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    try {
      await writeSpec({}, 'yaml');

      await runAtProjectDir(
        `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.yaml --out ${generatedClientDir} --from mjs --openapi-fallback fallback.yaml`
      );

      const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));

      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);
      const fallback = YAML.parse(await fs.readFile(path.join(artifactsDir, 'fallback.yaml'), 'utf-8'));
      strictEqual(fallback.openapi, '3.1.0');
      strictEqual(fallback.paths['/test']?.post?.operationId, 'postTest');
    } catch (e) {
      httpServer.kill();
      await fs.rm(generatedClientDir, { recursive: true });
      throw e;
    }

    httpServer.kill();
    await fs.rm(generatedClientDir, { recursive: true });
  });

  await it.skip('can watch JSON file and regenerate on spec change', async () => {});

  await it('can watch JSON URL and regenerate on spec change', async () => {
    const httpServer = runAtProjectDir(`npx http-server ${artifactsDir} -p ${PORT} --cors`);
    const generatedClientDir = path.join(artifactsDir, 'generated-client' + Date.now());

    const watch = runAtProjectDir(
      `../dist/index.mjs generate --openapi http://localhost:${PORT}/spec.json --out ${generatedClientDir} --from mjs --watch 1`
    );

    try {
      await writeSpec();

      const { schema } = await import(path.join(generatedClientDir, 'index.mjs'));
      strictEqual(schema.segments.mixin.controllers.api.handlers.postTest.httpMethod, HttpMethod.POST);

      await writeSpec({ operationId: 'postTest2' });
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const { schema: schema2 } = await import(path.join(generatedClientDir, 'index.mjs'));
      strictEqual(schema2.segments.mixin.controllers.api.handlers.postTest2.httpMethod, HttpMethod.POST);
    } catch (e) {
      httpServer.kill();
      watch.kill();
      await fs.rm(generatedClientDir, { recursive: true });
      throw e;
    }

    httpServer.kill();
    watch.kill();
    await fs.rm(generatedClientDir, { recursive: true });
  });

  await it.skip('can watch YAML file and regenerate on spec change', async () => {});

  await it.skip('can watch YAML URL and regenerate on spec change', async () => {});

  // TODO check other flags
  // --openapi-root-url
  // --openapi-mixin-name
  // multiple --openapi flags
});
