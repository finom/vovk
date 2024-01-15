// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import type ClientController from './ClientController';
import { ClientController as ClientControllerClientized } from '@vovkts/client';
import { HttpException } from 'vovk'; // it's used by @vovkts/client
import { VovkClientBody, VovkClientParams, VovkClientQuery, VovkClientReturnType } from '../../../src';
import { it, xit, expect, describe } from '@jest/globals';

type ClientControllerType = typeof ClientController;

type ClientizedType = typeof ClientControllerClientized;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

describe('Client with @vovkts/client', () => {
  it(`Should handle simple requests + headers`, async () => {
    const result = await ClientControllerClientized.getHelloWorld({
      prefix,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests and return a normal array`, async () => {
    const result = await ClientControllerClientized.getHelloWorldArray({
      prefix,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string }[]).toEqual([{ hello: 'world' }]);
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await ClientControllerClientized.getHelloWorldAndEmptyGeneric();
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await ClientControllerClientized.getHelloWorld({
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await ClientControllerClientized.getWithParams({
      params: { hello: 'world' },
    });

    type Params = VovkClientParams<ClientizedType['getWithParams']>;

    null as unknown as VovkClientParams<ClientizedType['getWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkClientBody<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkClientBody<ClientizedType['getWithParams']> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkClientQuery<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkClientQuery<ClientizedType['getWithParams']> satisfies undefined;

    expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await ClientControllerClientized.postWithParams({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { query: 'queryValue' },
    });

    type Body = VovkClientBody<ClientizedType['postWithParams']>;

    type Query = VovkClientQuery<ClientizedType['postWithParams']>;

    type Params = VovkClientParams<ClientizedType['postWithParams']>;

    null as unknown as VovkClientBody<ClientizedType['postWithParams']> satisfies Body;
    // @ts-expect-error Expect error
    null as unknown as VovkClientBody<ClientControllerType['postWithParams']> satisfies { hello: 'foo' };

    null as unknown as VovkClientQuery<ClientizedType['postWithParams']> satisfies Query;
    // @ts-expect-error Expect error
    null as unknown as VovkClientQuery<ClientizedType['postWithParams']> satisfies { query: 'bar' };

    null as unknown as VovkClientParams<ClientizedType['postWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkClientBody<ClientizedType['postWithParams']> satisfies { hello: 'baz' };

    expect(result satisfies VovkClientReturnType<ClientizedType['postWithParams']>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { query: 'queryValue' },
    });
  });

  xit('Should handle basic client validation', async () => {
    const result = await ClientControllerClientized.postWithEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Client exception. Invalid body/);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Client exception. Invalid query/);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle basic server validation', async () => {
    const result = await ClientControllerClientized.postWithEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Server exception. Invalid body/);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Server exception. Invalid query/);

    await expect(async () => {
      await ClientControllerClientized.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod client validation', async () => {
    const result = await ClientControllerClientized.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Invalid body on client/);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Invalid query on client/);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod server validation', async () => {
    const result = await ClientControllerClientized.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid body on server/);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid query on server/);

    await expect(async () => {
      await ClientControllerClientized.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle form data and ignore zod errors', async () => {
    const formData = new FormData();
    formData.append('foo1', 'bar1');
    formData.append('foo2', 'bar2');

    const result = await ClientControllerClientized.postFormData({
      body: formData,
      query: { hello: 'world' },
    });

    expect(result).toEqual({
      query: { hello: 'world' },
      formData: { foo1: 'bar1', foo2: 'bar2' },
    });
  });

  // zod validation
});
