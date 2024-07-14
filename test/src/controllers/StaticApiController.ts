import { prefix, get } from 'vovk/index';

@prefix('static-api')
export default class StaticApiController {
  @get('endpoint-one')
  static endpointOne() {
    return { hello: 'one' };
  }

  @get('endpoint-two')
  static endpointTwo() {
    return { hello: 'two' };
  }
}
