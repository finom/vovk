import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type YupControllerAndServiceEntityController from './YupControllerAndServiceEntityController';

export default class YupControllerAndServiceEntityService {
  static getYupControllerAndServiceEntities = (
    q: VovkControllerQuery<typeof YupControllerAndServiceEntityController.getYupControllerAndServiceEntities>['q']
  ) => {
    return [{ q }];
  };

  static updateYupControllerAndServiceEntity = (
    id: string,
    q: VovkControllerQuery<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>['q'],
    body: VovkControllerBody<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
