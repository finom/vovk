import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type NoValidationControllerAndServiceEntityController from './NoValidationControllerAndServiceEntityController';

export default class NoValidationControllerAndServiceEntityService {
  static getNoValidationControllerAndServiceEntities = (
    search: VovkControllerQuery<
      typeof NoValidationControllerAndServiceEntityController.getNoValidationControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
  };

  static updateNoValidationControllerAndServiceEntity = (
    id: string,
    q: VovkControllerQuery<
      typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity
    >['q'],
    body: VovkControllerBody<
      typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity
    >
  ) => {
    return { id, q, body };
  };

  // ...
}
