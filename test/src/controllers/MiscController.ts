import { prefix, get, post, put, del, patch, head, options } from '../../../src';

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

  @put()
  static putMethod() {
    return {};
  }

  @del()
  static delMethod() {
    return {};
  }

  @patch()
  static patchMethod() {
    return {};
  }

  @head()
  static headMethod() {
    return {};
  }

  @options()
  static optionsMethod() {
    return {};
  }
}
