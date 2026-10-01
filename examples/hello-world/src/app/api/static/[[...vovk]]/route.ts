import { controllersToStaticParams, initSegment } from 'vovk';
import OpenApiController from '../../../../modules/static/openapi/openapi-controller';

const controllers = {
  OpenApiRPC: OpenApiController,
};

export type Controllers = typeof controllers;
export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}
export const { GET, OPTIONS } = initSegment({
  segmentName: 'static',
  emitSchema: true,
  controllers,
});
