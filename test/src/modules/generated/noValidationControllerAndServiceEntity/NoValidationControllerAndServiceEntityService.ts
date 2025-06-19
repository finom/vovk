import type { VovkBody, VovkQuery } from 'vovk';
import type NoValidationControllerAndServiceEntityController from './NoValidationControllerAndServiceEntityController.ts';

export default class NoValidationControllerAndServiceEntityService {
  static getNoValidationControllerAndServiceEntities = (
    search: VovkQuery<
      typeof NoValidationControllerAndServiceEntityController.getNoValidationControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
  };

  static updateNoValidationControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<
      typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity
    >['q'],
    body: VovkBody<typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
