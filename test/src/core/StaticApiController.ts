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

  @get('endpoint-three/{a}/{b}', {
    staticParams: [
      { a: 'a1', b: 'b1' },
      { a: 'a2', b: 'b2' },
      { a: 'a3', b: 'b3' },
    ],
  })
  static endpointThree() {
    // ...
  }
}
