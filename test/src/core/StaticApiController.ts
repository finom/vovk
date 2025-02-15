import { prefix, get, generateStaticAPI } from 'vovk';

@prefix('static-api')
export default class StaticApiController {
  @get('endpoint-one')
  static endpointOne() {
    return generateStaticAPI({ controllers: StaticApiController });
  }

  @get('endpoint-two')
  static endpointTwo() {
    return generateStaticAPI({ controllers: StaticApiController }, 'custom');
  }
}
