import { initVovk } from 'vovk';

import ClientController from 'src/client/ClientController';
import StreamingController from 'src/client/StreamingController';
import StreamingGeneratorController from 'src/client/StreamingGeneratorController';
import CostomMetadataController from 'src/client/CostomMetadataController';
import WithZodClientController from 'src/client/WithZodClientController';
import WithYupClientController from 'src/client/WithYupClientController';
import WithDtoClientController from 'src/client/WithDtoClientController';

const controllers = {
  ClientController,
  ClientController5x: ClientController,
  StreamingController,
  StreamingGeneratorController,
  CostomMetadataController,
  WithZodClientController,
  WithYupClientController,
  WithDtoClientController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: 'foo/client',
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
