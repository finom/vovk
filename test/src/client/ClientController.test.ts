import metadata from '../vovk-metadata.json';
import type ClientController from './ClientController';
import { clientizeController } from '../../../src/client';
import { HttpException, VovkBody, VovkParams, VovkQuery, VovkReturnType } from '../../../src';
import { it, expect, describe } from '@jest/globals';

import { validateEqualityOnClient } from './validateEquality';
import { zodValidateOnClient } from 'vovk-zod';

type ClientControllerType = typeof ClientController;

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<typeof ClientController>(metadata.ClientController, {
  defaultOptions: { prefix },
});

describe('Client', () => {
  it(`Should handle simple requests + headers`, async () => {
    const noOptionsController = clientizeController<typeof ClientController>(metadata.ClientController);
    const result = await noOptionsController.getHelloWorld({
      prefix,
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests and use empty generic`, async () => {
    const result = await defaultController.getHelloWorldAndEmptyGeneric();
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it(`Should handle simple requests with default options`, async () => {
    const result = await defaultController.getHelloWorld({
      headers: { 'x-test': 'world' },
    });
    expect(result satisfies { hello: string | null }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params', async () => {
    const result = await defaultController.getWithParams({
      params: { hello: 'world' },
    });

    type Params = VovkParams<ClientControllerType['getWithParams']>;

    null as unknown as VovkParams<ClientControllerType['getWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientControllerType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkBody<ClientControllerType['getWithParams']> satisfies undefined;

    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientControllerType['getWithParams']> satisfies { hello: 'world' };
    null as unknown as VovkQuery<ClientControllerType['getWithParams']> satisfies undefined;

    expect(result satisfies { hello: 'world' }).toEqual({ hello: 'world' });
  });

  it('Should handle requests with params, body and query', async () => {
    const result = await defaultController.postWithParams({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { query: 'queryValue' },
    });

    type Body = VovkBody<ClientControllerType['postWithParams']>;

    type Query = VovkQuery<ClientControllerType['postWithParams']>;

    type Params = VovkParams<ClientControllerType['postWithParams']>;

    null as unknown as VovkBody<ClientControllerType['postWithParams']> satisfies Body;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientControllerType['postWithParams']> satisfies { hello: 'foo' };

    null as unknown as VovkQuery<ClientControllerType['postWithParams']> satisfies Query;
    // @ts-expect-error Expect error
    null as unknown as VovkQuery<ClientControllerType['postWithParams']> satisfies { query: 'bar' };

    null as unknown as VovkParams<ClientControllerType['postWithParams']> satisfies Params;
    // @ts-expect-error Expect error
    null as unknown as VovkBody<ClientControllerType['postWithParams']> satisfies { hello: 'baz' };

    expect(result satisfies VovkReturnType<ClientControllerType['postWithParams']>).toEqual({
      params: { hello: 'world' },
      body: { isBody: true },
      query: { query: 'queryValue' },
    });
  });

  it('Should handle basic client validation', async () => {
    const clientValidationController = clientizeController<typeof ClientController>(metadata.ClientController, {
      defaultOptions: { prefix },
      validateOnClient: validateEqualityOnClient,
    });

    const result = await clientValidationController.postWithEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await clientValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Client exception. Invalid body/);

    await expect(async () => {
      await clientValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await clientValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Client exception. Invalid query/);

    await expect(async () => {
      await clientValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle basic server validation', async () => {
    const serverValidationController = clientizeController<typeof ClientController>(metadata.ClientController, {
      defaultOptions: { prefix },
      validateOnClient: validateEqualityOnClient,
      disableClientValidation: true,
    });

    const result = await serverValidationController.postWithEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Server exception. Invalid body/);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Server exception. Invalid query/);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod client validation', async () => {
    const clientZodController = clientizeController<typeof ClientController>(metadata.ClientController, {
      defaultOptions: { prefix },
      validateOnClient: zodValidateOnClient,
    });

    const result = await clientZodController.postWithZodValidationAndEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await clientZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Invalid body on client/);

    await expect(async () => {
      await clientZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await clientZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Invalid query on client/);

    await expect(async () => {
      await clientZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod server validation', async () => {
    const serverZodController = clientizeController<typeof ClientController>(metadata.ClientController, {
      defaultOptions: { prefix },
      validateOnClient: zodValidateOnClient,
      disableClientValidation: true,
    });

    const result = await serverZodController.postWithZodValidationAndEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await serverZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Invalid body on server/);

    await expect(async () => {
      await serverZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await serverZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Invalid query on server/);

    await expect(async () => {
      await serverZodController.postWithZodValidationAndEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle form data and ignore zod errors', async () => {
    const formData = new FormData();
    formData.append('foo1', 'bar1');
    formData.append('foo2', 'bar2');

    const result = await defaultController.postFormData({
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
