import { deepStrictEqual, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { createRPC } from 'vovk/create-rpc';
import { openAPIToVovkSchema } from 'vovk/internal';

type Method = ((input?: object) => Promise<unknown>) & { getURL: (input?: object) => string };

function mixinModule(paths: OpenAPIObject['paths']) {
  const schema = openAPIToVovkSchema({
    source: {
      object: {
        openapi: '3.1.0',
        info: { title: 'Test', version: '1.0.0' },
        servers: [{ url: 'https://api.example.com' }],
        paths,
      },
    },
    getModuleName: () => 'TestAPI',
    getMethodName: ({ operationObject }) => operationObject.operationId ?? 'op',
    segmentName: 'test',
  });
  return createRPC(schema, 'test', 'TestAPI') as unknown as Record<string, Method>;
}

const queryOf = (url: string) => (url.includes('?') ? url.slice(url.indexOf('?') + 1) : '');

describe('OpenAPI mixin requests', () => {
  const array = { type: 'array', items: { type: 'string' } } as const;
  const object = { type: 'object', additionalProperties: { type: 'string' } } as const;
  const { listPets } = mixinModule({
    '/pets': {
      get: {
        operationId: 'listPets',
        parameters: [
          { name: 'tags', in: 'query', style: 'form', explode: true, schema: array },
          { name: 'ids', in: 'query', style: 'form', explode: false, schema: array },
          { name: 'colors', in: 'query', style: 'pipeDelimited', schema: array },
          { name: 'words', in: 'query', style: 'spaceDelimited', explode: false, schema: array },
          { name: 'filter', in: 'query', style: 'deepObject', explode: true, schema: object },
          { name: 'undeclared', in: 'query', schema: array },
          { name: 'point', in: 'query', schema: object },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'ok' } },
      },
    },
  });

  it('Sends each query parameter in the style it declares', () => {
    const url = listPets.getURL({
      query: {
        tags: ['a', 'b'],
        ids: ['1', '2'],
        colors: ['red', 'green'],
        words: ['x y', 'z'],
        filter: { status: 'sold', 'a b': 'c' },
      },
    });
    strictEqual(
      queryOf(url),
      'tags=a&tags=b&ids=1,2&colors=red|green&words=x%20y%20z&filter%5Bstatus%5D=sold&filter%5Ba%20b%5D=c'
    );
  });

  it('Sends a query parameter that declares no style as form and exploded', () => {
    const url = listPets.getURL({ query: { undeclared: ['a', 'b'], point: { x: '1', y: '2' }, limit: 5 } });
    strictEqual(queryOf(url), 'undeclared=a&undeclared=b&x=1&y=2&limit=5');
  });

  it('Encodes a delimiter inside a value', () => {
    const url = listPets.getURL({ query: { ids: ['1,2', '3'], colors: ['a|b'] } });
    strictEqual(queryOf(url), 'ids=1%2C2,3&colors=a%7Cb');
  });

  it('Leaves out empty and missing values', () => {
    strictEqual(queryOf(listPets.getURL({ query: { tags: [], ids: [], filter: {}, limit: undefined } })), '');
  });

  it('Sends a lone surrogate as U+FFFD and a value with toJSON as its JSON form', () => {
    const url = listPets.getURL({ query: { tags: ['ab\uD83D', new URL('https://x.test/a')] } });
    strictEqual(queryOf(url), 'tags=ab%EF%BF%BD&tags=https%3A%2F%2Fx.test%2Fa');
  });

  it('Sends a form body property in the style its encoding declares', async () => {
    const { createCustomer } = mixinModule({
      '/v1/customers': {
        post: {
          operationId: 'createCustomer',
          requestBody: {
            content: {
              'application/x-www-form-urlencoded': {
                encoding: {
                  metadata: { style: 'deepObject', explode: true },
                  expand: { style: 'deepObject', explode: true },
                  ids: { style: 'form', explode: false },
                },
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    metadata: object,
                    expand: array,
                    ids: array,
                    tags: array,
                    address: object,
                  },
                },
              },
            },
          },
          responses: { '200': { description: 'ok' } },
        },
      },
    });
    const { fetch } = globalThis;
    let sent: [string, string][] = [];
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      sent = [...(init.body as URLSearchParams).entries()];
      return new Response('{}', { headers: { 'content-type': 'application/json' } });
    }) as typeof globalThis.fetch;
    try {
      await createCustomer({
        body: {
          email: 'a@b.c',
          metadata: { order_id: '6735' },
          expand: ['tax', 'invoice'],
          ids: ['1', '2'],
          tags: ['a', 'b'],
          address: { city: 'Kyiv' },
        },
        disableClientValidation: true,
      });
    } finally {
      globalThis.fetch = fetch;
    }
    deepStrictEqual(sent, [
      ['email', 'a@b.c'],
      ['metadata[order_id]', '6735'],
      ['expand[0]', 'tax'],
      ['expand[1]', 'invoice'],
      ['ids', '1,2'],
      // no style declared: repeated for an array, JSON for an object
      ['tags', 'a'],
      ['tags', 'b'],
      ['address', '{"city":"Kyiv"}'],
    ]);
  });
});
