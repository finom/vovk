import { it, describe } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import { OpenApiControllerRPC } from 'vovk-client';
import { HttpStatus } from 'vovk';

describe('OpenAPI', () => {
  it(`Should work`, async () => {
    const result = await OpenApiControllerRPC.openapi();

    deepStrictEqual(result.info, {
      description: 'Vovk test app',
      title: 'Hello, OpenAPI!',
      version: '1.0.0',
    });
    deepStrictEqual(result.servers, [
      {
        url: 'http://localhost:3000',
      },
    ]);
    strictEqual(result.paths?.['/api/foo/client/openapi'].get?.summary, 'Hello, World!');
    strictEqual(
      result.paths?.['/api/foo/client/openapi'].get?.responses?.[HttpStatus.I_AM_A_TEAPOT]?.description,
      `${HttpStatus.I_AM_A_TEAPOT} I am a teapot`
    );

    strictEqual(
      result.paths?.['/api/foo/client/openapi'].get?.responses?.[HttpStatus.I_AM_A_TEAPOT]?.content?.[
        'application/json'
      ]?.schema?.allOf?.[1]?.properties?.message?.enum?.[0],
      'I am a teapot error'
    );
  });
});
