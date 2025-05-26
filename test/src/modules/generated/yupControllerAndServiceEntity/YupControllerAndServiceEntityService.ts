import type { VovkBody, VovkQuery } from 'vovk';
import type YupControllerAndServiceEntityController from './YupControllerAndServiceEntityController';

export default class YupControllerAndServiceEntityService {
  static getYupControllerAndServiceEntities = (
    search: VovkQuery<typeof YupControllerAndServiceEntityController.getYupControllerAndServiceEntities>['search']
  ) => {
    return { results: [], search };
  };

  static updateYupControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>['q'],
    body: VovkBody<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
