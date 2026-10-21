import { get, operation } from 'vovk';
import { openapi } from '@/client/openapi';

export default class OpenApiController {
  @operation({ summary: 'OpenAPI spec', description: 'The OpenAPI 3.1 spec of the task API.', security: [] })
  @get('openapi.json', { cors: true })
  static getSpec = () => openapi;
}
