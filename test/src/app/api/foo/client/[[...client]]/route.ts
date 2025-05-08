import { initVovk } from 'vovk';

import CommonController from '../../../../../client/CommonController';
import StreamingController from '../../../../../client/StreamingController';
import StreamingGeneratorController from '../../../../../client/StreamingGeneratorController';
import CustomSchemaController from '../../../../../client/CustomSchemaController';
import WithZodClientController from '../../../../../client/WithZodClientController';
import WithYupClientController from '../../../../../client/WithYupClientController';
import WithDtoClientController from '../../../../../client/WithDtoClientController';
import OpenApiController from '../../../../../client/OpenApiController';

const controllers = {
  CommonControllerRPC: CommonController,
  StreamingControllerRPC: StreamingController,
  StreamingGeneratorControllerRPC: StreamingGeneratorController,
  CustomSchemaControllerRPC: CustomSchemaController,
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
