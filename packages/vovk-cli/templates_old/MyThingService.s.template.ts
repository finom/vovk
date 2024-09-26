import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type MyThingController from './MyThingController.c.template';

export default class MyThingService {
  static getMyThingsExample = (q: VovkControllerQuery<typeof MyThingController.getMyThingsExample>['q']) => {
    return { q };
  };

  static updateMyThingExample = (
    id: string,
    q: VovkControllerQuery<typeof MyThingController.updateMyThingExample>['q'],
    body: VovkControllerBody<typeof MyThingController.updateMyThingExample>
  ) => {
    return { id, q, body };
  };

  // ...
}
