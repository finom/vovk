import { it, expect, describe } from '@jest/globals';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { OpenApiControllerRPC } from 'vovk-client';

describe('openapi decorator', () => {
  it(`Should write schema properly`, async () => {
    const result = await OpenApiControllerRPC.getSchema();
    expect(result satisfies OpenAPIObject).toEqual({
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
