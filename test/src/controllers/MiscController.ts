import { prefix, get, post } from '../../../src';

@prefix('misc')
export default class MiscController {
  @get()
  static getMethod() {
    return {};
  }

  @post()
  static postMethod() {
    return {};
  }
}
