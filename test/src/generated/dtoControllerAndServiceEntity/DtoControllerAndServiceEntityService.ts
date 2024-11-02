import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type DtoControllerAndServiceEntityController from './DtoControllerAndServiceEntityController';

export default class DtoControllerAndServiceEntityService {
  static getDtoControllerAndServiceEntities = (
    search: VovkControllerQuery<
      typeof DtoControllerAndServiceEntityController.getDtoControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
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
