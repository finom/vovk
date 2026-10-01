import { controllersToStaticParams, get, initSegment, operation } from 'vovk';
import { openapi } from '@/client/openapi';

class OpenApiController {
  @operation({
    summary: 'OpenAPI spec',
    description: 'Get the OpenAPI spec for the app API',
  })
  @get('openapi.json')
  static getSpec = () => openapi;

  @operation({
    summary: 'Hello World',
    description: 'Get a hello world message',
  })
  @get('hello.json')
  static helloWorld = () => ({ message: 'Hello, World!' });
}

const controllers = {
  OpenApiRPC: OpenApiController,
};

export type Controllers = typeof controllers;
export function generateStaticParams() {
  return controllersToStaticParams(controllers);
}
export const { GET } = initSegment({
  segmentName: 'static',
  emitSchema: true,
  controllers,
});
