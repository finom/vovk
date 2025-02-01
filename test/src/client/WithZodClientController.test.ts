import { it, expect, describe } from '@jest/globals';
import { WithZodClientControllerRPC } from 'vovk-client';
import { HttpException, type VovkReturnType, type VovkHandlerSchema } from 'vovk';
import { NESTED_QUERY_EXAMPLE } from './ClientController';

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

  it('Should store schema at handler.schema', async () => {
    expect(WithZodClientControllerRPC.postWithBodyQueryAndParams.schema satisfies VovkHandlerSchema).toEqual({
      httpMethod: 'POST',
      path: ':foo',
      validation: {
        body: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          additionalProperties: false,
          properties: {
            hello: {
              const: 'body',
              type: 'string',
            },
          },
          required: ['hello'],
          type: 'object',
        },
        query: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          additionalProperties: false,
          properties: {
            hey: {
              const: 'query',
              type: 'string',
            },
          },
          required: ['hey'],
          type: 'object',
        },
      },
    });
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

  it('Should handle nested queries on server', async () => {
    const { query, search } = await WithZodClientControllerRPC.getNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
      disableClientValidation: true,
    });

    expect(query satisfies VovkReturnType<typeof WithZodClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    expect(search).toEqual(
      '?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue'
    );

    const { rejects } = expect(async () => {
      await WithZodClientControllerRPC.getNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Zod validation failed. Invalid request query on server for http:.*. Required \(x\)/);
  });

  it('Should handle nested queries on client', async () => {
    const { query } = await WithZodClientControllerRPC.getNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
    });

    expect(query satisfies VovkReturnType<typeof WithZodClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    const { rejects } = expect(async () => {
      await WithZodClientControllerRPC.getNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request query on client for http:.*\. data\/x must be string/
    );
  });
});
