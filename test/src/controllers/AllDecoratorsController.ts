import { prefix, get, post, put, del, patch, head, options } from '../../../packages/vovk';

@prefix('all-decorators')
export default class AllDecoratorsController {
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

  @get('get-with-header', { headers: { 'x-decorator-header': 'hello' } })
  static getWithHeader() {
    return {};
  }
}
