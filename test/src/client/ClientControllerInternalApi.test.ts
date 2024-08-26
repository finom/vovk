// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import segmentsMetadata from '../../.vovk-schema';
import type ClientController from './ClientController';
import { clientizeController } from 'vovk/client';
import { it, expect, describe } from '@jest/globals';

import { _VovkControllerMetadata } from 'vovk/types';

const prefix = 'http://localhost:' + process.env.PORT + '/api';

const metadata = segmentsMetadata['foo/client'].controllers;

const defaultController = clientizeController<typeof ClientController>(
  metadata.ClientController as _VovkControllerMetadata,
  'foo/client',
  {
    defaultOptions: { prefix },
  }
);

describe('Internal client API', () => {
  it('Should use default options', async () => {
    const result = await defaultController.getHelloWorldObjectLiteral();
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });

  it('Should handle custom options', async () => {
    const noOptionsController = clientizeController<typeof ClientController>(
      metadata.ClientController as _VovkControllerMetadata,
      'foo/client'
    );
    const result = await noOptionsController.getHelloWorldObjectLiteral({
      prefix,
    });
    expect(result satisfies { hello: string }).toEqual({ hello: 'world' });
  });
});
