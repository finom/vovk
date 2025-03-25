import { prefix, get, post, put, del, patch, head, options, VovkRequest } from 'vovk';

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

  @get('get-with-cors', { cors: true })
  static getWithCors() {
    return {};
  }

  @get('get-with-before', { before: (req) => req.vovk.meta({ before: true }) })
  static getWithBefore(req: VovkRequest) {
    return { before: req.vovk.meta<{ before: boolean }>().before };
  }
}
