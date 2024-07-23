import { VovkErrorResponse } from '../../../packages/vovk';
import { request } from '../lib';
import { it, expect, describe } from '@jest/globals';

describe('Errors', () => {
  it('Handle simple errors', async () => {
    const response = await request.get(`/error/simple`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      message: 'ERROR1',
      statusCode: 500,
      isError: true,
    } satisfies VovkErrorResponse);
  });

  it('Handle code errors', async () => {
    const response = await request.get(`/error/code`);

    expect(response.status).toBe(500);
    expect(response.body).toStrictEqual({
      message: '{}.someMethod is not a function',
      statusCode: 500,
      isError: true,
    } satisfies VovkErrorResponse);
  });

  it('Handle HttpException', async () => {
    const response = await request.get(`/error/http-exception`);

    expect(response.status).toBe(418);
    expect(response.body).toStrictEqual({
      message: 'ERROR3',
      statusCode: 418,
      isError: true,
    } satisfies VovkErrorResponse);
  });
});
