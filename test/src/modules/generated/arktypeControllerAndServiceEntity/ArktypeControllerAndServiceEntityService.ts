import type { VovkBody, VovkQuery } from 'vovk';
import type ArktypeControllerAndServiceEntityController from './ArktypeControllerAndServiceEntityController.ts';

export default class ArktypeControllerAndServiceEntityService {
  static getArktypeControllerAndServiceEntities = (
    search: VovkQuery<
      typeof ArktypeControllerAndServiceEntityController.getArktypeControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
  };

  static updateArktypeControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<typeof ArktypeControllerAndServiceEntityController.updateArktypeControllerAndServiceEntity>['q'],
    body: VovkBody<typeof ArktypeControllerAndServiceEntityController.updateArktypeControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
