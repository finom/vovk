import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31';
import { openAPIToVovkSchema } from 'vovk/internal';

// biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
type Obj = Record<string, any>;

const thing: SchemaObject = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] };

function convert(spec: Partial<OpenAPIObject>, options: Obj = {}) {
  const schema = openAPIToVovkSchema({
    source: {
      object: {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        components: { schemas: { Thing: thing } },
        ...spec,
      } as OpenAPIObject,
    },
    getModuleName: () => 'TestAPI',
    getMethodName: ({ operationObject, method }) => operationObject.operationId ?? method.toLowerCase(),
    segmentName: 'api',
    ...options,
  });
  return schema.segments.api as Obj;
}

const handlersOf = (spec: Partial<OpenAPIObject>) => convert(spec).controllers.TestAPI.handlers as Obj;

describe('openAPIToVovkSchema — controller fields', () => {
  it('Gives every module the fields a client reads from a controller', () => {
    const segment = convert(
      {
        paths: {
          '/users': { get: { operationId: 'listUsers', responses: { '200': {} } } },
          '/posts': { get: { operationId: 'listPosts', responses: { '200': {} } } },
        },
      },
      { getModuleName: ({ path }: { path: string }) => (path === '/users' ? 'UsersAPI' : 'PostsAPI') }
    );
    for (const [key, controller] of Object.entries(segment.controllers as Obj)) {
      strictEqual(controller.rpcModuleName, key);
      strictEqual(controller.originalControllerName, key);
      strictEqual(controller.prefix, '');
    }
  });
});

describe('openAPIToVovkSchema — Path Item fields', () => {
  const spec: Partial<OpenAPIObject> = {
    components: {
      schemas: { Thing: thing },
      parameters: { Locale: { name: 'locale', in: 'query', schema: { type: 'string' } } },
    },
    paths: {
      '/things/{id}': {
        summary: 'A thing',
        description: 'Path-level description',
        servers: [{ url: 'https://other.example.com' }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { $ref: '#/components/parameters/Locale' },
        ],
        get: { operationId: 'getThing', responses: { '200': { description: 'OK' } } },
        delete: {
          operationId: 'deleteThing',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { '204': { description: 'Deleted' } },
        },
        trace: { operationId: 'traceThing', responses: { '200': { description: 'OK' } } },
      },
    },
  };

  it('Turns only HTTP methods into handlers', () => {
    deepStrictEqual(Object.keys(handlersOf(spec)), ['getThing', 'deleteThing']);
  });

  it('Applies path-level parameters to every operation', () => {
    const { getThing } = handlersOf(spec);
    deepStrictEqual(getThing.validation.params.properties, { id: { type: 'string' } });
    deepStrictEqual(getThing.validation.params.required, ['id']);
    deepStrictEqual(getThing.validation.query.properties, { locale: { type: 'string' } });
  });

  it('Lets an operation parameter override a path-level one with the same name and location', () => {
    const { deleteThing } = handlersOf(spec);
    deepStrictEqual(deleteThing.validation.params.properties, { id: { type: 'integer' } });
    deepStrictEqual(deleteThing.validation.query.properties, { locale: { type: 'string' } });
  });

  it('Resolves a Path Item $ref', () => {
    const handlers = handlersOf({
      components: {
        schemas: { Thing: thing },
        pathItems: { Things: { get: { operationId: 'listThings', responses: { '200': { description: 'OK' } } } } },
      },
      paths: { '/things': { $ref: '#/components/pathItems/Things' } },
    });
    deepStrictEqual(Object.keys(handlers), ['listThings']);
  });
});

describe('openAPIToVovkSchema — request body types', () => {
  const bodyOf = (content: Obj) =>
    handlersOf({
      paths: {
        '/things': { post: { operationId: 'createThing', requestBody: { content }, responses: { '201': {} } } },
      },
    }).createThing.validation.body as Obj | undefined;

  it('Types a $ref JSON body with its Mixins type', () => {
    const body = bodyOf({ 'application/json': { schema: { $ref: '#/components/schemas/Thing' } } });
    strictEqual(body?.['x-tsType'], 'Mixins.Api.Thing');
  });

  it('Types a nested $ref of an inline JSON body', () => {
    const body = bodyOf({
      'application/json': {
        schema: { type: 'object', properties: { thing: { $ref: '#/components/schemas/Thing' } } },
      },
    });
    strictEqual(body?.['x-tsType'], undefined, 'the schema is compiled to its type, nothing overrides it');
    strictEqual(body?.properties.thing['x-tsType'], 'Mixins.Api.Thing');
  });

  it('Names the Mixins type of a component that starts with a digit as vovk-cli declares it', () => {
    const body = handlersOf({
      components: { schemas: { '2FAConfig': thing } },
      paths: {
        '/2fa': {
          put: {
            operationId: 'update2fa',
            requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/2FAConfig' } } } },
            responses: { '200': {} },
          },
        },
      },
    }).update2fa.validation.body as Obj;
    strictEqual(body['x-tsType'], 'Mixins.Api._2FaConfig');
  });

  it('Types a form body with the Mixins type next to FormData', () => {
    const body = bodyOf({ 'multipart/form-data': { schema: { $ref: '#/components/schemas/Thing' } } });
    strictEqual(body?.['x-tsType'], 'FormData | Mixins.Api.Thing');
  });

  it('Types the nested refs of a form body', () => {
    const body = bodyOf({
      'application/x-www-form-urlencoded': {
        schema: { type: 'object', properties: { thing: { $ref: '#/components/schemas/Thing' } }, required: ['thing'] },
      },
    });
    strictEqual(body?.['x-tsType'], 'FormData | URLSearchParams | { thing: Mixins.Api.Thing }');
  });

  it('Reads a JSON body declared with media type parameters', () => {
    const body = bodyOf({ 'application/json; charset=utf-8': { schema: { $ref: '#/components/schemas/Thing' } } });
    deepStrictEqual(body?.['x-contentType'], ['application/json']);
    strictEqual(body?.$ref, '#/$defs/Thing');
  });

  it('Reads a +json body as JSON', () => {
    const body = bodyOf({ 'application/merge-patch+json': { schema: { $ref: '#/components/schemas/Thing' } } });
    deepStrictEqual(body?.['x-contentType'], ['application/json']);
    strictEqual(body?.$ref, '#/$defs/Thing');
  });

  it('Prefers application/json over a +json sibling', () => {
    const body = bodyOf({
      'application/vnd.api+json': { schema: { type: 'string' } },
      'application/json': { schema: { $ref: '#/components/schemas/Thing' } },
    });
    strictEqual(body?.$ref, '#/$defs/Thing');
  });
});

describe('openAPIToVovkSchema — server URL', () => {
  it('Substitutes the default of every server variable', () => {
    const segment = convert({
      servers: [
        {
          url: 'https://{region}.example.com/{version}',
          variables: { region: { default: 'eu', enum: ['eu', 'us'] }, version: { default: 'v2' } },
        },
      ],
      paths: {},
    });
    strictEqual(segment.forceApiRoot, 'https://eu.example.com/v2');
  });

  it('Keeps a variable that declares no default', () => {
    const segment = convert({ servers: [{ url: 'https://api.example.com/{version}' }], paths: {} });
    strictEqual(segment.forceApiRoot, 'https://api.example.com/{version}');
  });

  it('Prefers apiRoot from the config', () => {
    const segment = convert(
      { servers: [{ url: 'https://{region}.example.com', variables: { region: { default: 'eu' } } }], paths: {} },
      { apiRoot: 'https://proxy.example.com' }
    );
    strictEqual(segment.forceApiRoot, 'https://proxy.example.com');
  });
});

describe('openAPIToVovkSchema — method name collisions', () => {
  const warn = mock.fn();
  beforeEach(() => {
    warn.mock.resetCalls();
    mock.method(console, 'warn', warn);
  });
  afterEach(() => mock.restoreAll());

  it('Keeps both operations when their names collide', () => {
    const handlers = handlersOf({
      paths: {
        '/users/{id}': { get: { operationId: 'getUser', responses: { '200': {} } } },
        '/accounts/{id}': { get: { operationId: 'getUser', responses: { '200': {} } } },
        '/admins/{id}': { get: { operationId: 'getUser', responses: { '200': {} } } },
      },
    });
    deepStrictEqual(
      Object.entries(handlers).map(([name, { path }]) => [name, path]),
      [
        ['getUser', '/users/{id}'],
        ['getUser_2', '/accounts/{id}'],
        ['getUser_3', '/admins/{id}'],
      ]
    );
    strictEqual(warn.mock.callCount(), 2);
    ok(String(warn.mock.calls[0].arguments[0]).includes('GET /accounts/{id}'));
  });

  it('Gives a name to one operation per module', () => {
    const segment = convert(
      {
        paths: {
          '/users': { get: { operationId: 'list', responses: { '200': {} } } },
          '/posts': { get: { operationId: 'list', responses: { '200': {} } } },
        },
      },
      { getModuleName: ({ path }: { path: string }) => (path === '/users' ? 'UsersAPI' : 'PostsAPI') }
    );
    deepStrictEqual(Object.keys(segment.controllers.UsersAPI.handlers), ['list']);
    deepStrictEqual(Object.keys(segment.controllers.PostsAPI.handlers), ['list']);
    strictEqual(warn.mock.callCount(), 0);
  });
});
