import { get, HttpStatus, prefix, operation } from 'vovk';
import { openapi } from 'vovk-client/openapi';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @operation({
    summary: 'Hello, World!',
  })
  @operation.error(HttpStatus.I_AM_A_TEAPOT, 'I am a teapot error')
  static openapi() {
    return { openapi };
  }
}
