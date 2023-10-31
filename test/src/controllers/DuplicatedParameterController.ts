import { prefix, get } from '../../../src';

@prefix('duplicated-parameter')
export default class DuplicatedParameterController {
  @get(':id/foo/:id')
  static get() {
    return {};
  }
}
