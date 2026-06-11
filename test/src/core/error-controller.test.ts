import { it, describe } from 'node:test';
import { strictEqual, deepStrictEqual } from 'node:assert';
import type { VovkErrorResponse } from 'vovk/internal';
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

    strictEqual(response.status, 500);
    deepStrictEqual(response.body, {
      message: '{}.someMethod is not a function',
      statusCode: 500,
      isError: true,
    } satisfies VovkErrorResponse);
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
