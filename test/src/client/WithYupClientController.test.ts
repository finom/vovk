import { it, expect, describe } from '@jest/globals';
import { WithYupClientController } from '../../.vovk/client';
import { HttpException } from 'vovk';
import validateOnClient from 'vovk-yup/validateOnClient';

describe('Validation with with vovk-yup', () => {
  it('Should handle Yup server validation', async () => {
    const result = await WithYupClientController.postWithBodyAndQuery({
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
      await WithYupClientController.postWithBodyAndQuery({
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
      await WithYupClientController.postWithBodyAndQuery({
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
    const result = await WithYupClientController.postWithBodyAndQuery({
      body: { hello: 'body' },
      query: { hey: 'query' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' }; query: { hey: 'query' } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    let { rejects } = expect(async () => {
      await WithYupClientController.postWithBodyAndQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        query: { hey: 'query' },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid request body on client for http:.*. hello must be one of the following values: body/
    );
    await rejects.toThrowError(HttpException);

    ({ rejects } = expect(async () => {
      await WithYupClientController.postWithBodyAndQuery({
        body: { hello: 'body' },
        query: {
          hey: 'wrong' as 'query',
        },
        validateOnClient,
      });
    }));

    await rejects.toThrow(
      /Yup validation failed. Invalid request query on client for http:.*. hey must be one of the following values: query/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body and null query', async () => {
    const result = await WithYupClientController.putWithBodyAndNullQuery({
      body: { hello: 'body' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientController.putWithBodyAndNullQuery({
        body: {
          hello: 'wrong' as 'body',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid request body on client for http:.*. hello must be one of the following values: body/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles requests with body only', async () => {
    const result = await WithYupClientController.putWithBodyOnly({
      body: { hello: 'body' },
      validateOnClient,
    });

    expect(result satisfies { body: { hello: 'body' } }).toEqual({
      body: { hello: 'body' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientController.putWithBodyOnly({
        body: {
          hello: 'wrong' as 'body',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid request body on client for http:.*. hello must be one of the following values: body/
    );
    await rejects.toThrowError(HttpException);
  });

  it('Handles with query only', async () => {
    const result = await WithYupClientController.getWithQueryAndNullBody({
      query: { hey: 'query' },
      validateOnClient,
    });

    expect(result satisfies { query: { hey: 'query' } }).toEqual({
      query: { hey: 'query' },
    });

    const { rejects } = expect(async () => {
      await WithYupClientController.getWithQueryAndNullBody({
        query: {
          hey: 'wrong' as 'query',
        },
        validateOnClient,
      });
    });

    await rejects.toThrow(
      /Yup validation failed. Invalid request query on client for http:.*. hey must be one of the following values: query/
    );
    await rejects.toThrowError(HttpException);
  });
});
