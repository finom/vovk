import { get, prefix, openapi } from 'vovk';
import fullSchema from '../../.vovk-schema/index.cjs';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @openapi({
    summary: 'Hello, World!',
  })
  static getSchema() {
    return openapi.fromSchema('api', fullSchema);
  }
}
