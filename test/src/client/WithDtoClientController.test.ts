import { it, xit, expect, describe } from '@jest/globals';
import { WithDtoClientController } from '../../.vovk/client';
import { HttpException } from 'vovk';
import validateOnClient from 'vovk-dto/validateOnClient';
import { plainToInstance } from 'class-transformer';
import { BodyDto, QueryDto, ReturnDto } from './WithDtoClientController';

describe('Validation with with vovk-dto', () => {
  it('Should handle DTO server validation', async () => {
    const result = await WithDtoClientController.postWithBodyAndQuery({
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
      await WithDtoClientController.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        disableClientValidation: true,
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed\. Invalid request body on server for http:.*\. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithDtoClientController.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
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
    const result = await WithDtoClientController.postWithBodyAndQuery({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      query: plainToInstance(QueryDto, { hey: 'query' }),
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithDtoClientController.postWithBodyAndQuery({
        body: plainToInstance(BodyDto, {
          hello: 'wrong' as 'body',
        }),
        query: plainToInstance(QueryDto, { hey: 'query' }),
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Validation failed\. Invalid request body on client for http:.*\. hello must contain a body string/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithDtoClientController.postWithBodyAndQuery({
        body: plainToInstance(BodyDto, { hello: 'body' }),
        query: plainToInstance(QueryDto, {
          hey: 'wrong' as 'query',
        }),
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Validation failed\. Invalid request query on client for http:.*\. hey must contain a query string/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithDtoClientController.putWithBodyAndNullQuery({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithDtoClientController.putWithBodyAndNullQuery({
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
    const result = await WithDtoClientController.putWithBodyOnly({
      body: plainToInstance(BodyDto, { hello: 'body' }),
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: plainToInstance(BodyDto, { hello: 'body' }),
    });

    const { rejects } = expect(async () => {
      await WithDtoClientController.putWithBodyOnly({
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
    const result = await WithDtoClientController.getWithQueryAndNullBody({
      query: plainToInstance(QueryDto, { hey: 'query' }),
      validateOnClient,
    });

    expect(result satisfies { query: { hey: 'query' } }).toEqual({
      query: plainToInstance(QueryDto, { hey: 'query' }),
    });

    const { rejects } = expect(async () => {
      await WithDtoClientController.getWithQueryAndNullBody({
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

  // TODO
  xit('Handles query as an array', () => {});
  xit('req.vovk.body and req.vovk.query should return an instance of a DTO', () => {});

  it('Should transform response on client-side to a DTO class', async () => {
    const result = await WithDtoClientController.postWithBodyAndQueryTransformed({
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
