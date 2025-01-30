import { it, expect, describe } from '@jest/globals';
import { WithYupClientControllerRPC } from 'vovk-client';
import { HttpException, VovkReturnType } from 'vovk';
import validateOnClient from 'vovk-yup/validateOnClient';
import { NESTED_QUERY_EXAMPLE } from './ClientController';

describe('Validation with with vovk-yup', () => {
  it('Should handle Yup server validation', async () => {
    const result = await WithYupClientControllerRPC.postWithBodyAndQuery({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
      validateOnClient,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithYupClientControllerRPC.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        disableClientValidation: true,
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid request body on server for http:.*. hello must be one of the following values: body/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithYupClientControllerRPC.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        disableClientValidation: true,
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Yup validation failed. Invalid request query on server for http:.*. hey must be one of the following values: query/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle Yup client validation', async () => {
    const result = await WithYupClientControllerRPC.postWithBodyAndQuery({
      body: { hello: 'body' },
      query: { hey: 'query' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithYupClientControllerRPC.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*. data\/hello must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithYupClientControllerRPC.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Ajv validation failed. Invalid request query on client for http:.*. data\/hey must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithYupClientControllerRPC.putWithBodyAndNullQuery({
      body: { hello: 'body' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientControllerRPC.putWithBodyAndNullQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*. data\/hello must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body only', async () => {
    const result = await WithYupClientControllerRPC.putWithBodyOnly({
      body: { hello: 'body' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientControllerRPC.putWithBodyOnly({
        body: {
          hello: 'wrong' as 'body',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request body on client for http:.*. data\/hello must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles with query only', async () => {
    const result = await WithYupClientControllerRPC.getWithQueryAndNullBody({
      query: { hey: 'query' },
      validateOnClient,
    });

    expect(result satisfies { query: { hey: 'query' } }).toEqual({
      query: { hey: 'query' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientControllerRPC.getWithQueryAndNullBody({
        query: {
          hey: 'wrong' as 'query',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Ajv validation failed. Invalid request query on client for http:.*. data\/hey must be equal to one of the allowed values/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle nested queries on server', async () => {
    const { query, search } = await WithYupClientControllerRPC.getNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
      disableClientValidation: true,
    });

    expect(query satisfies VovkReturnType<typeof WithYupClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    expect(search).toEqual(
      '?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue'
    );

    const { rejects } = expect(async () => {
      await WithYupClientControllerRPC.getNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Yup validation failed. Invalid request query on server for http:.*. x is a required field/);
  });

  it('Should handle nested queries on client', async () => {
    const { query } = await WithYupClientControllerRPC.getNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
      validateOnClient,
    });

    expect(query satisfies VovkReturnType<typeof WithYupClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    const { rejects } = expect(async () => {
      await WithYupClientControllerRPC.getNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(/Ajv validation failed. Invalid request query on client for http:.*. data\/x must be string/);
  });
});
