import { initSegment } from 'vovk';

import CommonController from '../../../../../client/CommonController.ts';
import StreamingController from '../../../../../client/StreamingController.ts';
import StreamingGeneratorController from '../../../../../client/StreamingGeneratorController.ts';
import CustomSchemaController from '../../../../../client/CustomSchemaController.ts';
import WithZodClientController from '../../../../../client/WithZodClientController.ts';
import OpenApiController from '../../../../../client/OpenApiController.ts';

const controllers = {
  CommonControllerRPC: CommonController,
  StreamingControllerRPC: StreamingController,
  StreamingGeneratorControllerRPC: StreamingGeneratorController,
  CustomSchemaControllerRPC: CustomSchemaController,
  WithZodClientControllerRPC: WithZodClientController,
  OpenApiControllerRPC: OpenApiController,
};

export type Controllers = typeof controllers;

export const { GET, POST, PATCH, PUT, HEAD, OPTIONS, DELETE } = initSegment({
  segmentName: 'foo/client',
  exposeValidation: true,
  emitSchema: true,
  controllers,
  onError: (err, req) => {
    // eslint-disable-next-line no-console
    console.log('onError', err.message, req.url);
  },
});
