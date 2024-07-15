import { it, expect, describe } from '@jest/globals';
import { WithZodClientController } from '../../.vovk/client';
import { HttpException } from 'vovk';

describe('Validation with with vovk-zod', () => {
  it('Should handle zod client validation', async () => {
    const result = await WithZodClientController.postWithBodyAndQuery({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithZodClientController.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
      });
    });

    await rejects.toThrow(/Invalid request body on client for/);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithZodClientController.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
      });
    }));

    await rejects.toThrow(/Invalid request query on client for/);
    await rejects.toThrowError(HttpException);
  });

  it('Should handle zod server validation', async () => {
    const result = await WithZodClientController.postWithBodyAndQuery({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithZodClientController.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Invalid request body on server for /);
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithZodClientController.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        disableClientValidation: true,
      });
    }));

    await rejects.toThrow(/Invalid request query on server for /);
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithZodClientController.putWithBodyAndNullQuery({
      body: { hello: 'body' },
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientController.putWithBodyAndNullQuery({
        body: {
          hello: 'wrong' as 'body',
        },
      });
    });

    await rejects.toThrow(/Invalid request body on client for/);
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body only', async () => {
    const result = await WithZodClientController.putWithBodyOnly({
      body: { hello: 'body' },
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientController.putWithBodyOnly({
        body: {
          hello: 'wrong' as 'body',
        },
      });
    });

    await rejects.toThrow(/Invalid request body on client for/);
    await rejects.toThrowError(HttpException);
  });

  it('Handles with query only', async () => {
    const result = await WithZodClientController.getWithQueryAndNullBody({
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: 'query' } }).toEqual({
      query: { hey: 'query' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientController.getWithQueryAndNullBody({
        query: {
          hey: 'wrong' as 'query',
        },
      });
    });

    await rejects.toThrow(/Invalid request query on client for/);
    await rejects.toThrowError(HttpException);
  });
});
