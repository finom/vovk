import { deepStrictEqual, match, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import type { VovkErrorResponse } from '../../../packages/vovk/dist/types/core.js';
import { request } from '../lib.ts';

describe('Errors', () => {
  it('Handle simple errors', async () => {
    const response = await request.get(`/error/simple`);

    strictEqual(response.status, 500);
    deepStrictEqual(response.body, {
      message: 'ERROR1',
      statusCode: 500,
      isError: true,
    } satisfies VovkErrorResponse);
  });

  it('Handle code errors', async () => {
    const response = await request.get(`/error/code`);

    // the message text is the engine's own (V8, JavaScriptCore)
    const { message, ...rest } = response.body as VovkErrorResponse;
    strictEqual(response.status, 500);
    match(message, /someMethod/);
    match(message, /not a function/);
    deepStrictEqual(rest, { statusCode: 500, isError: true });
  });

  it('Handle HttpException', async () => {
    const response = await request.get(`/error/http-exception`);

    strictEqual(response.status, 418);
    deepStrictEqual(response.body, {
      message: 'ERROR3',
      statusCode: 418,
      isError: true,
      cause: { some: 'problem' },
    } satisfies VovkErrorResponse);
  });
});
