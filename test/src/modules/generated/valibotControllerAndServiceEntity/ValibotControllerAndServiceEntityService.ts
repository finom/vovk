import type { VovkBody, VovkQuery } from 'vovk';
import type ValibotControllerAndServiceEntityController from './ValibotControllerAndServiceEntityController.ts';

export default class ValibotControllerAndServiceEntityService {
  static getValibotControllerAndServiceEntities = (
    search: VovkQuery<
      typeof ValibotControllerAndServiceEntityController.getValibotControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
  };

  static updateValibotControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<typeof ValibotControllerAndServiceEntityController.updateValibotControllerAndServiceEntity>['q'],
    body: VovkBody<typeof ValibotControllerAndServiceEntityController.updateValibotControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
