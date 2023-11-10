import { createSegment } from '../../../../../../src';

const { get, activateControllers } = createSegment();

class IsolatedController {
  @get()
  static get() {
    return { isolated: true };
  }
}

export const { GET } = activateControllers({ controllers: [IsolatedController] });
