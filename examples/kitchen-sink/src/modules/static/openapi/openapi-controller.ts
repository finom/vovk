import { get, operation } from 'vovk';
import { openapi } from '@/client/openapi.ts';

export default class OpenApiController {
  @operation({
    summary: 'OpenAPI spec',
    description: 'Get the OpenAPI spec for the examples API',
  })
  @get('openapi.json')
  static getSpec = () => openapi;
}
