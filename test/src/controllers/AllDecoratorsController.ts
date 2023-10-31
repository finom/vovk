import { prefix, get, post, put, del, patch, head, options } from '../../../src';

@prefix('all-decorators')
export default class AllDecoratorsController {
  @get()
  static get() {
    return {};
  }

  @post()
  static post() {
    return {};
  }

  @put()
  static put() {
    return {};
  }

  @del()
  static del() {
    return {};
  }

  @patch()
  static patch() {
    return {};
  }

  @head()
  static head() {
    return {};
  }

  @options()
  static options() {
    return {};
  }
}
