// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { ClientController as ClientControllerClientized } from '../../.vovk/client';
import { HttpException } from 'vovk';
import { VovkBody, VovkParams, VovkQuery, VovkReturnType } from 'vovk';
import { it, xit, expect, describe } from '@jest/globals';
import type ClientController from './ClientController';

type ClientControllerType = typeof ClientController;

type ClientizedType = typeof ClientControllerClientized;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

describe('Client with vovk-client', () => {
  it(`Should handle requests that return NextResponse.json`, async () => {
    const result = await ClientControllerClientized.getHelloWorldResponseObject();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals`, async () => {
    const result = await ClientControllerClientized.getHelloWorldObjectLiteral({
      prefix,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle requests that return NextResponse.json and are async`, async () => {
    const result = await ClientControllerClientized.getHelloWorldResponseObjectPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle object literals and are async`, async () => {
    const result = await ClientControllerClientized.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it(`Should handle headers`, async () => {
    const result = await ClientControllerClientized.getHelloWorldHeaders({
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
    const result = await ClientControllerClientized.getHelloWorldObjectLiteralPromise();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await ClientControllerClientized.getWithParams({
      params: { hello: 'world' },
    });

    type Params = VovkParams<ClientizedType['getWithParams']>;

    null as unknown as VovkParams<ClientizedType['getWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkBody<ClientizedType['getWithParams']> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientizedType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkQuery<ClientizedType['getWithParams']> satisfies undefined;

    expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await ClientControllerClientized.postWithParams({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
    });

    type Body = VovkBody<ClientizedType['postWithParams']>;

    type Query = VovkQuery<ClientizedType['postWithParams']>;

    type Params = VovkParams<ClientizedType['postWithParams']>;

    null as unknown as VovkBody<ClientizedType['postWithParams']> satisfies Body;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientControllerType['postWithParams']> satisfies { hello: 'foo' };

    null as unknown as VovkQuery<ClientizedType['postWithParams']> satisfies Query;
    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientizedType['postWithParams']> satisfies { query: 'bar' };

    null as unknown as VovkParams<ClientizedType['postWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientizedType['postWithParams']> satisfies { hello: 'baz' };

    expect(result satisfies VovkReturnType<ClientizedType['postWithParams']>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { simpleQueryParam: 'queryValue', arrayQueryParam: ['foo', 'bar'] },
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
    }).rejects.toThrow(/Invalid request body on client for/);

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
    }).rejects.toThrow(/Invalid request query on client for/);

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
});
