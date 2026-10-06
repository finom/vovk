import { cloneControllerMetadata, get, prefix } from 'vovk';
import DecorateController from './decorate-controller.ts';

@prefix('decorate-class')
class DecorateClassController {
  @get()
  static async getMethod() {
    return { method: 'get', source: 'decorate-class' };
  }

  @get('with-path')
  static async getWithPath() {
    return { path: 'with-path', source: 'decorate-class' };
  }
}

export default DecorateClassController;

@cloneControllerMetadata()
@prefix('decorate-cloned')
class DecorateClonedController extends DecorateController {}

export { DecorateClonedController };
