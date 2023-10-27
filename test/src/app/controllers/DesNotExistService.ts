import { prefix, get } from '../../../../src';

@prefix('post-does-not-exist')
export default class DesNotExistService {
  @get('hello')
  static hello() {
    return {};
  }

  // @post doesn't exist
}
