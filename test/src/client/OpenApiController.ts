import { get, prefix } from 'vovk';
import { openapi, fromSchema } from 'vovk-openapi';
import { fullSchema } from 'vovk-client';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @openapi({
    summary: 'Hello, World!',
  })
  static getSchema() {
    return fromSchema('api', fullSchema);
  }
}
