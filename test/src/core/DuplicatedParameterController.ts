import { prefix, get } from 'vovk';

@prefix('duplicated-parameter')
export default class DuplicatedParameterController {
  @get('{id}/foo/{id}')
  static get() {
    return {};
  }
}
