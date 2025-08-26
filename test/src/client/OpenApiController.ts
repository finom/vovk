import { get, HttpStatus, prefix, operation } from 'vovk';
import { schema } from 'vovk-client';

@prefix('openapi')
export default class OpenApiController {
  @get()
  @operation({
    summary: 'Hello, World!',
  })
  @operation.error(HttpStatus.I_AM_A_TEAPOT, 'I am a teapot error')
  static getFromSchema() {
    // @ts-expect-error TODO!
    return fromSchema({
      rootEntry: 'api',
      schema,
      openAPIObject: {
        info: {
          title: 'Hello, OpenAPI!',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
          },
        ],
      },
    });
  }
}
