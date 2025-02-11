import { initVovk } from 'vovk';

import ClientController from '../../../../../client/ClientController';
import StreamingController from '../../../../../client/StreamingController';
import StreamingGeneratorController from '../../../../../client/StreamingGeneratorController';
import CostomSchemaController from '../../../../../client/CostomSchemaController';
import WithZodClientController from '../../../../../client/WithZodClientController';
import WithYupClientController from '../../../../../client/WithYupClientController';
import WithDtoClientController from '../../../../../client/WithDtoClientController';
import OpenApiController from '../../../../../client/OpenApiController';

const controllers = {
  ClientControllerRPC: ClientController,
  StreamingControllerRPC: StreamingController,
  StreamingGeneratorControllerRPC: StreamingGeneratorController,
  CostomSchemaControllerRPC: CostomSchemaController,
  WithZodClientControllerRPC: WithZodClientController,
  WithYupClientControllerRPC: WithYupClientController,
  WithDtoClientControllerRPC: WithDtoClientController,
  OpenApiControllerRPC: OpenApiController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initVovk({
  segmentName: 'foo/client',
  exposeValidation: true,
  emitSchema: true,
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
