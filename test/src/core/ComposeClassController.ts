import { get, compose, prefix, cloneControllerMetadata } from 'vovk';
import ComposeController from './ComposeController.ts';

// Test class-level compose: applies prefix decorator without @ syntax
// Also uses compose for handlers (no decorator syntax at all)
class ComposeClassControllerBase {
  static getMethod = compose(get(), async () => {
    return { method: 'get', source: 'compose-class' };
  });

  static getWithPath = compose(get('with-path'), async () => {
    return { path: 'with-path', source: 'compose-class' };
  });
}

const ComposeClassController = compose(prefix('compose-class'), ComposeClassControllerBase);

export default ComposeClassController;

// Test class-level compose with cloneControllerMetadata
export const ComposeClonedController = compose(
  prefix('compose-cloned'),
  cloneControllerMetadata(),
  class extends ComposeController {}
);
