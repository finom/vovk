import type { VovkBody, VovkQuery } from 'vovk';
import type DtoControllerAndServiceEntityController from './DtoControllerAndServiceEntityController';

export default class DtoControllerAndServiceEntityService {
  static getDtoControllerAndServiceEntities = (
    search: VovkQuery<typeof DtoControllerAndServiceEntityController.getDtoControllerAndServiceEntities>['search']
  ) => {
    return { results: [], search };
  };

  static updateDtoControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>['q'],
    body: VovkBody<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
