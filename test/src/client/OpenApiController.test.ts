import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { OpenApiControllerRPC } from 'vovk-client';

describe('openapi decorator', () => {
  it.skip(`Should write schema properly`, async () => {
    const result = await OpenApiControllerRPC.getSchema();
    deepStrictEqual(result satisfies OpenAPIObject, {
      openapi: '3.1.0',
      paths: {
        '/api/foo/client/openapi': {
          get: {
            summary: 'Hello, World!',
          },
        },
      },
      info: {
        title: 'API',
        version: '1.0.0',
      },
    });
  });
});
