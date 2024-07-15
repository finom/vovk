import { it, expect, describe } from '@jest/globals';
import { WithZodClientController } from '../../.vovk/client';
import { HttpException } from 'vovk';

describe('Validation with with vovk-zod', () => {
  it('Should handle zod client validation', async () => {
    const result = await WithZodClientController.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Invalid request body on client for/);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
      });
    }).rejects.toThrow(/Invalid request query on client for/);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod server validation', async () => {
    const result = await WithZodClientController.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid body on server/);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid query on server/);

    await expect(async () => {
      await WithZodClientController.postWithZodValidation({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);
  });
});
