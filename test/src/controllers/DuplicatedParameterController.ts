import { prefix, get } from '../../../packages/vovk';

@prefix('duplicated-parameter')
export default class DuplicatedParameterController {
  @get(':id/foo/:id')
  static get() {
    return {};
  }
}
