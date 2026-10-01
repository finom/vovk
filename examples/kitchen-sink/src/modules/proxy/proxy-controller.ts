import { get, prefix, operation } from 'vovk';

@prefix('proxy')
export default class ProxyController {
  @operation({
    summary: 'Proxy procedure',
    description: 'Get a greeting from vovk.dev',
  })
  @get('greeting', { cors: true })
  static getHello() {
    return fetch('https://vovk.dev/api/hello/greeting.json') as unknown as { greeting: 'Hello world!' };
  }
}
