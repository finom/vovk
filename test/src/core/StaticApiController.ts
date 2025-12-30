import { prefix, get, controllersToStaticParams } from 'vovk';

@prefix('static-api')
export default class StaticApiController {
  @get('endpoint-one')
  static endpointOne() {
    return controllersToStaticParams({ controllers: StaticApiController });
  }

  @get('endpoint-two')
  static endpointTwo() {
    return controllersToStaticParams({ controllers: StaticApiController }, 'custom');
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
