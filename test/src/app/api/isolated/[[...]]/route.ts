import { createSegment } from '../../../../../../src';

const { get, initVovk } = createSegment();

class IsolatedController {
  @get()
  static get() {
    return { isolated: true };
  }
}

export const { GET } = initVovk({
  controllers: { IsolatedController },
  emitMetadata: false,
});
