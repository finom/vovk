import { get, decorate, cloneControllerMetadata } from 'vovk';
import DecorateController from './DecorateController.ts';

// Test class-level prefix via static property: no decorator syntax at all
// Also uses decorate for handlers (no decorator syntax at all)
class DecorateClassController {
  static prefix = 'decorate-class';

  static getMethod = decorate(get()).handle(async () => {
    return { method: 'get', source: 'decorate-class' };
  });

  static getWithPath = decorate(get('with-path')).handle(async () => {
    return { path: 'with-path', source: 'decorate-class' };
  });
}

export default DecorateClassController;

// Test cloneControllerMetadata applied programmatically
class DecorateClonedController extends DecorateController {
  static prefix = 'decorate-cloned';
}
cloneControllerMetadata()(DecorateClonedController);
export { DecorateClonedController };
