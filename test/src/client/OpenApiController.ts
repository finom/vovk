import { get, HttpStatus, prefix } from 'vovk';
import { openapi, fromSchema } from 'vovk-openapi';
import { schema } from 'vovk-client';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @openapi({
    summary: 'Hello, World!',
  })
  @openapi.error(HttpStatus.I_AM_A_TEAPOT, 'I am a teapot error')
  static getFromSchema() {
    return fromSchema('api', schema, {
      info: {
        title: 'Hello, OpenAPI!',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
    });
  }
}
