import { get, prefix } from 'vovk';

@prefix('hello')
export default class HelloController {
  @get('greeting.json')
  static getHello() {
    return { greeting: 'Hello world!' };
  }
}
