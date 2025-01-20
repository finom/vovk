import { it, expect, describe } from '@jest/globals';
import { WithZodClientControllerRPC } from 'vovk-client';
import { HttpException } from 'vovk';

describe('Validation with with vovk-zod and validateOnClient defined at settings', () => {
  it('Should handle Zod server validation', async () => {
    const result = await WithZodClientControllerRPC.postWithBodyQueryAndParams({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { foo: 'bar' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { foo: 'bar' },
    });

    let { rejects } = expect(async () => {
      await WithZodClientControllerRPC.postWithBodyQueryAndParams({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        params: { foo: 'bar' },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(
      /Zod validation failed. Invalid request body on server for http:.*. Invalid literal value, expected "body" \(hello\)/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithZodClientControllerRPC.postWithBodyQueryAndParams({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        params: { foo: 'bar' },
        disableClientValidation: true,
      });
    }));

    await rejects.toThrow(
      /Zod validation failed. Invalid request query on server for http:.*\. Invalid literal value, expected "query" \(hey\)/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle Zod client validation', async () => {
    const result = await WithZodClientControllerRPC.postWithBodyQueryAndParams({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { foo: 'bar' },
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { foo: 'bar' },
    });

    let { rejects } = expect(async () => {
      await WithZodClientControllerRPC.postWithBodyQueryAndParams({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        params: { foo: 'bar' },
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*\. data\/hello must be equal to constant/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithZodClientControllerRPC.postWithBodyQueryAndParams({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        params: { foo: 'bar' },
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid request query on client for http:.*\. data\/hey must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithZodClientControllerRPC.putWithBodyAndNullQuery({
      body: { hello: 'body' },
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientControllerRPC.putWithBodyAndNullQuery({
        body: {
          hello: 'wrong' as 'body',
        },
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*\. data\/hello must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body only', async () => {
    const result = await WithZodClientControllerRPC.putWithBodyOnly({
      body: { hello: 'body' },
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientControllerRPC.putWithBodyOnly({
        body: {
          hello: 'wrong' as 'body',
        },
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*\. data\/hello must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles with query only', async () => {
    const result = await WithZodClientControllerRPC.getWithQueryAndNullBody({
      query: { hey: 'query' },
    });

    expect(result satisfies { query: { hey: 'query' } }).toEqual({
      query: { hey: 'query' },
    });

    const { rejects } = expect(async () => {
      await WithZodClientControllerRPC.getWithQueryAndNullBody({
        query: {
          hey: 'wrong' as 'query',
        },
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request query on client for http:.*\. data\/hey must be equal to constant/
    );
    await rejects.toThrowError(HttpException);
  });
});
