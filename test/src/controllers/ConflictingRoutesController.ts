import { prefix, get } from '../../../packages/vovk';

@prefix('conflicting-routes')
export default class ConflictingRoutesController {
  @get('hello/:foo')
  static foo() {
    return {};
  }

  @get('hello/:bar')
  static bar() {
    return {};
  }
}
