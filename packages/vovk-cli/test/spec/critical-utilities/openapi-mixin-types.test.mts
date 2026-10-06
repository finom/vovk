import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { JSONSchema7 } from 'json-schema';
import camelCase from 'lodash/camelCase.js';
import upperFirst from 'lodash/upperFirst.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { openAPIToVovkSchema, toTypeName } from 'vovk/internal';
import { compileJSONSchemaToTypeScriptType } from '../../../dist/utils/compile-json-schema-to-typescript-type.mjs';
import { normalizeOpenAPIMixin } from '../../../dist/utils/normalize-openapi-mixin.mjs';

const spec: OpenAPIObject = {
  openapi: '3.1.0',
  info: { title: 'Users', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com' }],
  components: {
    schemas: {
      UserInput: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] },
      '2FAConfig': { type: 'object', properties: { secret: { type: 'string' } } },
    },
  },
  paths: {
    '/users': {
      post: {
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      servers: [{ url: 'https://eu.api.example.com' }],
      get: { responses: { '200': { description: 'OK' } } },
      patch: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { user: { $ref: '#/components/schemas/UserInput' } },
                required: ['user'],
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/users/{id}/2fa': {
      put: {
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/2FAConfig' } } } },
        responses: { '200': { description: 'OK' } },
      },
    },
  },
};

async function convert() {
  const mixin = await normalizeOpenAPIMixin({
    mixinModule: { source: { object: structuredClone(spec) }, getModuleName: 'UsersAPI', getMethodName: 'auto' },
    log: console as never,
  });
  // biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
  const segment = openAPIToVovkSchema({ ...mixin, segmentName: 'api' }).segments.api as any;
  return segment.controllers.UsersAPI.handlers;
}

const bodyType = (body: JSONSchema7) => compileJSONSchemaToTypeScriptType(body, 'Body');

await describe('OpenAPI mixin with the default method names', async () => {
  await it('Names the operations of a path that declares path-level fields', async () => {
    assert.deepStrictEqual(Object.keys(await convert()), [
      'createUsers',
      'getUsersById',
      'patchUsersById',
      'updateUsers2faById',
    ]);
  });

  await it('Types a body that refers to a component', async () => {
    const { createUsers, patchUsersById } = await convert();
    assert.strictEqual(bodyType(createUsers.validation.body), 'export type Body = Mixins.Api.UserInput;');
    assert.strictEqual(bodyType(patchUsersById.validation.body), 'export type Body = { user: Mixins.Api.UserInput };');
  });

  await it('Refers to a component that starts with a digit by the name it is declared with', async () => {
    const { updateUsers2faById } = await convert();
    const declaration = compileJSONSchemaToTypeScriptType(
      spec.components?.schemas?.['2FAConfig'] as JSONSchema7,
      '2FAConfig',
      spec.components,
      { dontCreateRefTypes: true }
    );
    assert.match(declaration, /^export type _2FaConfig = /);
    assert.strictEqual(bodyType(updateUsers2faById.validation.body), 'export type Body = Mixins.Api._2FaConfig;');
  });
});

await describe('OpenAPI mixin names', async () => {
  await it('Makes a camel-case-operation-id method name that starts with a digit an identifier', async () => {
    const { getMethodName } = await normalizeOpenAPIMixin({
      mixinModule: { source: { object: spec }, getMethodName: 'camel-case-operation-id' },
      log: console as never,
    });
    const name = getMethodName({
      operationObject: { operationId: '2fa_verify' },
      method: 'POST',
      path: '/2fa',
      openAPIObject: spec,
    } as never);
    assert.strictEqual(name, '_2FaVerify');
  });

  await it('Gives an ASCII name the type name lodash gave it', () => {
    const names = ['petstore', 'userID', 'HTTPResponse', 'ABC1', 'HTTP2Server', 'v2-api', '1st', "dont's", 'x$y'];
    for (const name of names) {
      const lodashName = upperFirst(camelCase(name));
      assert.strictEqual(toTypeName(name), /^\d/.test(lodashName) ? `_${lodashName}` : lodashName, name);
    }
  });
});

// openAPIToVovkSchema strips `x-tsType` from a third-party spec; a plain `tsType` must not reach the types either,
// or a spec could put any TypeScript into mixins.d.ts
await describe('OpenAPI mixin with an untrusted tsType', async () => {
  // a balanced payload: it stays valid TS so the client still generates, and declares a type the host controls
  const payload = 'string;\n      export type InjectedBySpecHost = { pwned: true };\n      export type _Tail = 0';

  const evilSpec: OpenAPIObject = {
    openapi: '3.1.0',
    info: { title: 'Evil', version: '1.0.0' },
    servers: [{ url: 'https://evil.example' }],
    paths: {
      '/thing': {
        get: {
          operationId: 'getThing',
          responses: {
            '200': {
              description: 'ok',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Thing' } } },
            },
          },
        },
      },
    },
    // `tsType` (no `x-` prefix) is never set by vovk, only honored on the way out
    components: { schemas: { Thing: { type: 'object', tsType: payload } as never } },
  };

  await it('does not emit a tsType supplied by the spec into the generated types', async () => {
    const mixin = await normalizeOpenAPIMixin({
      mixinModule: { source: { object: structuredClone(evilSpec) }, getModuleName: 'EvilAPI', getMethodName: 'auto' },
      log: console as never,
    });
    // biome-ignore lint/suspicious/noExplicitAny: loose test alias for readable assertions
    const segment = openAPIToVovkSchema({ ...mixin, segmentName: 'api' }).segments.api as any;
    const components = segment.meta.openAPIObject.components;
    // mixins.d.ts.ejs compiles each component schema into the Mixins namespace
    const componentTs = compileJSONSchemaToTypeScriptType(components.schemas.Thing, 'Thing', components, {
      dontCreateRefTypes: true,
    });
    assert.ok(
      !componentTs.includes('InjectedBySpecHost'),
      `the spec's tsType reached the generated TypeScript: ${componentTs}`
    );
  });
});
