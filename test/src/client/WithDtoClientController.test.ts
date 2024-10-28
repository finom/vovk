import { it, expect, describe } from '@jest/globals';
import { WithDtoClientControllerRPC } from '../../.vovk-client/client';
import { HttpException } from 'vovk';
import validateOnClient from 'vovk-dto/validateOnClient';
import { plainToInstance } from 'class-transformer';
import { BodyDto, QueryDto, QueryWithArrayDto, ReturnDto } from './WithDtoClientController';

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
});
