// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import metadata from '../../.vovk.json';
import type ClientController from './ClientController';
import { clientizeController } from 'vovk/client';
import { HttpException } from 'vovk';
import { it, expect, describe } from '@jest/globals';

import { validateEqualityOnClient } from './validateEquality';
import validateOnClientAjv from 'vovk-client-validate-ajv';
import { _VovkControllerMetadata } from 'vovk/types';

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = clientizeController<typeof ClientController>(
  metadata.ClientController as _VovkControllerMetadata,
  {
    defaultOptions: { prefix },
  }
);

describe('Client API', () => {
  it('Should use default options', async () => {
    const result = await defaultController.getHelloWorldObjectLiteral();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle custom options', async () => {
    const noOptionsController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata
    );
    const result = await noOptionsController.getHelloWorldObjectLiteral({
      prefix,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle basic client validation', async () => {
    const clientValidationController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata,
      {
        defaultOptions: { prefix },
        validateOnClient: validateEqualityOnClient,
      }
    );

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
    const serverValidationController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata,
      {
        defaultOptions: { prefix },
        validateOnClient: validateEqualityOnClient,
      }
    );

    const result = await serverValidationController.postWithEqualityValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Server exception. Invalid body/);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Server exception. Invalid query/);

    await expect(async () => {
      await serverValidationController.postWithEqualityValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod client validation', async () => {
    const clientZodController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata,
      {
        defaultOptions: { prefix },
        validateOnClient: validateOnClientAjv,
      }
    );

    const result = await clientZodController.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await clientZodController.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrow(/Invalid request body on client for/);

    await expect(async () => {
      await clientZodController.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await clientZodController.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrow(/Invalid request query on client for/);

    await expect(async () => {
      await clientZodController.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
      });
    }).rejects.toThrowError(HttpException);
  });

  it('Should handle zod server validation', async () => {
    const serverZodController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata,
      {
        defaultOptions: { prefix },
        validateOnClient: validateOnClientAjv,
      }
    );

    const result = await serverZodController.postWithZodValidation({
      body: { hello: 'body' },
      query: { hey: 'query' },
      disableClientValidation: true,
    });

    expect(result satisfies { body: { hello: string }; query: { hey: string } }).toEqual({
      body: { hello: 'body' },
      query: { hey: 'query' },
    });

    await expect(async () => {
      await serverZodController.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid body on server/);

    await expect(async () => {
      await serverZodController.postWithZodValidation({
        body: { hello: 'wrong' },
        query: { hey: 'query' },
        disableClientValidation: true,
      });
    }).rejects.toThrowError(HttpException);

    await expect(async () => {
      await serverZodController.postWithZodValidation({
        body: { hello: 'body' },
        query: { hey: 'wrong' },
        disableClientValidation: true,
      });
    }).rejects.toThrow(/Invalid query on server/);

    await expect(async () => {
      await serverZodController.postWithZodValidation({
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

    const result = await defaultController.postFormData({
      body: formData,
      query: { hello: 'world' },
    });

    expect(result).toEqual({
      query: { hello: 'world' },
      formData: { foo1: 'bar1', foo2: 'bar2' },
    });
  });
});
