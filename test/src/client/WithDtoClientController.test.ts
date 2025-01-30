import { it, expect, describe } from '@jest/globals';
import { WithDtoClientControllerRPC } from 'vovk-client';
import { HttpException, VovkReturnType } from 'vovk';
import validateOnClient from 'vovk-dto/validateOnClient';
import { plainToInstance } from 'class-transformer';
import { BodyDto, NestedExampleObjectDTO, QueryDto, QueryWithArrayDto, ReturnDto } from './WithDtoClientController';
import { NESTED_QUERY_EXAMPLE } from './ClientController';

describe('Validation with with vovk-dto', () => {
  it('Should handle DTO server validation', async () => {
    const result = await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { param: 'foo' },
      disableClientValidation: true,
      validateOnClient,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { param: 'foo' },
    });

    let { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        params: { param: 'foo' },
        disableClientValidation: true,
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed\. Invalid request body on server for http:.*\. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        params: { param: 'foo' },
        disableClientValidation: true,
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Validation failed\. Invalid request query on server for http:.*\. hey must contain a query string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Should handle DTO client validation', async () => {
    const result = await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      query: plainToInstance(QueryDto, { hey: 'query' }),
      params: { param: 'foo' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
      params: { param: 'foo' },
    });

    let { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
        body: plainToInstance(BodyDto, {
          hello: 'wrong' as 'body',
        }),
        query: plainToInstance(QueryDto, { hey: 'query' }),
        params: { param: 'foo' },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed\. Invalid request body on client for http:.*\. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithDtoClientControllerRPC.postWithBodyQueryAndParams({
        body: plainToInstance(BodyDto, { hello: 'body' }),
        query: plainToInstance(QueryDto, {
          hey: 'wrong' as 'query',
        }),
        params: { param: 'foo' },
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Validation failed\. Invalid request query on client for http:.*\. hey must contain a query string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithDtoClientControllerRPC.putWithBodyAndNullQuery({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.putWithBodyAndNullQuery({
        body: plainToInstance(BodyDto, {
          hello: 'wrong' as 'body',
        }),
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed. Invalid request body on client for http:.*. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body only', async () => {
    const result = await WithDtoClientControllerRPC.putWithBodyOnly({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: plainToInstance(BodyDto, { hello: 'body' }),
    });

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.putWithBodyOnly({
        body: plainToInstance(BodyDto, {
          hello: 'wrong' as 'body',
        }),
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed. Invalid request body on client for http:.*. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles with query only', async () => {
    const result = await WithDtoClientControllerRPC.getWithQueryAndNullBody({
      query: plainToInstance(QueryDto, { hey: 'query' }),
      validateOnClient,
    });

    expect(result satisfies { query: { hey: 'query' } }).toEqual({
      query: plainToInstance(QueryDto, { hey: 'query' }),
    });

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.getWithQueryAndNullBody({
        query: plainToInstance(QueryDto, {
          hey: 'wrong' as 'query',
        }),
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed. Invalid request query on client for http:.*. hey must contain a query string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles query as an array client validation', async () => {
    const query = { array1: ['foo'], array2: ['bar', 'baz'], hey: 'query' };
    const result = await WithDtoClientControllerRPC.getWithQueryArrayAndNullBody({
      query: plainToInstance(QueryWithArrayDto, query),
      validateOnClient,
    });

    expect(result satisfies { query: typeof query }).toEqual({
      query,
    });

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.getWithQueryArrayAndNullBody({
        query: plainToInstance(QueryWithArrayDto, {
          array1: [1],
          array2: ['bar', 'baz'],
          hey: 'query',
        }),
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed. Invalid request query on client for http:.*. each value in array1 must be a string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles query as an array server validation', async () => {
    let query = { array1: ['foo'] as 'foo'[], array2: ['bar', 'baz'] as ('bar' | 'baz')[], hey: 'query' as const };
    const result = await WithDtoClientControllerRPC.getWithQueryArrayAndNullBody({
      query,
      disableClientValidation: true,
      validateOnClient,
    });

    expect(result satisfies { query: typeof query }).toEqual({ query });

    query = { array1: ['foo'], array2: ['bar'], hey: 'query' };

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.getWithQueryArrayAndNullBody({
        query: plainToInstance(QueryWithArrayDto, query),
        disableClientValidation: true,
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed. Invalid request query on server for http:.*. array2 must contain at least 2 elements/
    );
    await rejects.toThrowError(HttpException);
  });

  it('req.vovk.body and req.vovk.query should return an instance of a DTO', async () => {
    const result = await WithDtoClientControllerRPC.postWithBodyAndQueryWithReqVovk({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      query: plainToInstance(QueryDto, { hey: 'query' }),
      validateOnClient,
    });

    expect(
      result satisfies {
        body: { hello: 'body' };
        query: { hey: 'query' };
        bodyInstanceOfDto: boolean;
        queryInstanceOfDto: boolean;
      }
    ).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
      bodyInstanceOfDto: true,
      queryInstanceOfDto: true,
    });
  });

  it('Should transform response on client-side to a DTO class', async () => {
    const result = await WithDtoClientControllerRPC.postWithBodyAndQueryTransformed({
      body: { hello: 'body' },
      query: { hey: 'query' },
      transform: (resp) => plainToInstance(ReturnDto, resp),
      validateOnClient,
    });

    expect(result satisfies ReturnDto).toEqual({
      hello: 'body',
      hey: 'query',
    });

    expect(result instanceof ReturnDto).toBe(true);
  });

  it('Works with mapped types', async () => {
    const result = await WithDtoClientControllerRPC.putWithMappedType({
      body: { hello: 'hello_body', world: 'world_body' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'hello_body'; world: 'world_body' } }).toEqual({
      body: { hello: 'hello_body', world: 'world_body' },
    });
  });

  it('Should handle nested queries on server', async () => {
    const { query, search } = await WithDtoClientControllerRPC.getNestedQuery({
      query: NESTED_QUERY_EXAMPLE,
      disableClientValidation: true,
    });

    expect(query satisfies VovkReturnType<typeof WithDtoClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    expect(search).toEqual(
      '?x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee&z[d][arrOfObjects][0][foo]=bar&z[d][arrOfObjects][0][nestedArr][0]=one&z[d][arrOfObjects][0][nestedArr][1]=two&z[d][arrOfObjects][0][nestedArr][2]=three&z[d][arrOfObjects][1][foo]=baz&z[d][arrOfObjects][1][nestedObj][deepKey]=deepValue'
    );

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.getNestedQuery({
        query: {
          ...NESTED_QUERY_EXAMPLE,
          // @ts-expect-error Expect error
          x: null,
        },
        disableClientValidation: true,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid request query on server for http:.*. x must be a string/);
  });

  it('Should handle nested queries on client', async () => {
    const { query } = await WithDtoClientControllerRPC.getNestedQuery({
      query: plainToInstance(NestedExampleObjectDTO, NESTED_QUERY_EXAMPLE),
      validateOnClient,
    });

    expect(query satisfies VovkReturnType<typeof WithDtoClientControllerRPC.getNestedQuery>['query']).toEqual(
      NESTED_QUERY_EXAMPLE
    );

    const { rejects } = expect(async () => {
      await WithDtoClientControllerRPC.getNestedQuery({
        query: plainToInstance(NestedExampleObjectDTO, {
          ...NESTED_QUERY_EXAMPLE,
          x: null,
        }),
        validateOnClient,
      });
    });

    await rejects.toThrow(/Validation failed. Invalid request query on client for http:.*. x must be a string/);
  });
});
