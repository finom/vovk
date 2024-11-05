import segmentsSchema from '../../.vovk-schema';
import type ClientController from './ClientController';
import { clientizeController } from 'vovk/client';
import { it, expect, describe } from '@jest/globals';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

const schema = segmentsSchema['foo/client'].controllers;

const defaultController = clientizeController<typeof ClientController>(schema.ClientControllerRPC, 'foo/client', {
  defaultOptions: { apiRoot },
});

describe('Internal client API', () => {
  it('Should use default options', async () => {
    const result = await defaultController.getHelloWorldObjectLiteral();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle custom options', async () => {
    const noOptionsController = clientizeController<typeof ClientController>(schema.ClientControllerRPC, 'foo/client');
    const result = await noOptionsController.getHelloWorldObjectLiteral({
      apiRoot,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });
});
