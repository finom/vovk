import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type DtoControllerAndServiceEntityController from './DtoControllerAndServiceEntityController';

export default class DtoControllerAndServiceEntityService {
  static getDtoControllerAndServiceEntities = (
    q: VovkControllerQuery<typeof DtoControllerAndServiceEntityController.getDtoControllerAndServiceEntities>['q']
  ) => {
    return [{ q }];
  };

  static updateDtoControllerAndServiceEntity = (
    id: string,
    q: VovkControllerQuery<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>['q'],
    body: VovkControllerBody<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
