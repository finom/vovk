import { prefix, get, post, put, del, patch, head, options } from 'vovk';

@prefix('auto-decorators')
export default class AutoDecoratorsController {
  @get.auto()
  static getMethod() {
    return {};
  }

  @post.auto()
  static postMethod() {
    return {};
  }

  @put.auto()
  static putMethod() {
    return {};
  }

  @del.auto()
  static delMethod() {
    return {};
  }

  @patch.auto()
  static patchMethod() {
    return {};
  }

  @head.auto()
  static headMethod() {
    return {};
  }

  @options.auto()
  static optionsMethod() {
    return {};
  }

  @get.auto({ headers: { 'x-decorator-header': 'hello' } })
  static getWithHeader() {
    return {};
  }
}
