import { prefix, get } from '../../../src';

@prefix('duplicated-parameter')
export default class DuplicatedParameterService {
  @get(':id/foo/:id')
  static get() {
    return {};
  }
}
