import { schema } from 'vovk-client';
import type ClientController from './CommonController.ts';
import { createRPC, VovkDefaultFetcherOptions } from 'vovk';
import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = createRPC<typeof ClientController, VovkDefaultFetcherOptions>(
  schema,
  'foo/client',
  'CommonControllerRPC',
  {
    apiRoot,
  }
);

describe('Internal client API', () => {
  it('Should use default options', async () => {
    const result = await defaultController.getHelloWorldObjectLiteral();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it('Should handle custom options', async () => {
    const noOptionsController = createRPC<typeof ClientController, VovkDefaultFetcherOptions>(
      schema,
      'foo/client',
      'CommonControllerRPC'
    );
    const result = await noOptionsController.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });
});
