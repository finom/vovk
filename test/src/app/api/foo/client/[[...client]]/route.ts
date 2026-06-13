import { initSegment } from 'vovk';

import CommonController from '../../../../../client/common-controller.ts';
import CustomSchemaController from '../../../../../client/custom-schema-controller.ts';
import OpenApiController from '../../../../../client/openapi-controller.ts';
import StreamingController from '../../../../../client/streaming-controller.ts';
import StreamingGeneratorController from '../../../../../client/streaming-generator-controller.ts';
import WithValidationController from '../../../../../validation/with-validation-controller.ts';
import WithValidationDecorateController from '../../../../../validation/with-validation-decorate-controller.ts';

const controllers = {
  CommonControllerRPC: CommonController,
  StreamingControllerRPC: StreamingController,
  StreamingGeneratorControllerRPC: StreamingGeneratorController,
  CustomSchemaControllerRPC: CustomSchemaController,
  WithValidationRPC: WithValidationController,
  WithValidationDecorateRPC: WithValidationDecorateController,
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
