import { createController } from '../../../../../../src';

const { get, RouteHandlers } = createController();

class IsolatedController extends RouteHandlers {
  @get()
  get() {
    return { isolated: true };
  }
}

export const { GET } = IsolatedController;
