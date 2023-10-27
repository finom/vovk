import { prefix, get } from '../../../../src';

@prefix('conflicting-routes')
export default class ConflictingRoutesService {
  @get('hello/:foo')
  static foo() {
    return {};
  }

  @get('hello/:bar')
  static bar() {
    return {};
  }
}
