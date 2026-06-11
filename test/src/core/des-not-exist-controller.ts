import { prefix, get } from 'vovk';

@prefix('post-does-not-exist')
export default class DesNotExistController {
  @get('hello')
  static hello() {
    return {};
  }

  // @post doesn't exist
}
