import fullSchema from '../../.vovk-schema/main.cjs';
import type ClientController from './ClientController';
import { createRPC } from 'vovk';
import { it, describe } from 'node:test';
import { deepStrictEqual } from 'node:assert';

const apiRoot = 'http://localhost:' + process.env.PORT + '/api';

const defaultController = createRPC<typeof ClientController>(fullSchema, 'foo/client', 'ClientControllerRPC', {
  defaultOptions: { apiRoot },
});

describe('Internal client API', () => {
  it('Should use default options', async () => {
    const result = await defaultController.getHelloWorldObjectLiteral();
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });

  it('Should handle custom options', async () => {
    const noOptionsController = createRPC<typeof ClientController>(fullSchema, 'foo/client', 'ClientControllerRPC');
    const result = await noOptionsController.getHelloWorldObjectLiteral({
      apiRoot,
    });
    deepStrictEqual(result satisfies { hello: string }, { hello: 'world' });
  });
});
