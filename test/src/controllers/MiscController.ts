import { prefix, get, post } from '../../../packages/vovk';

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
