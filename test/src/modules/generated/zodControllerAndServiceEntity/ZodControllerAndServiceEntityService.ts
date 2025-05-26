import type { VovkBody, VovkQuery } from 'vovk';
import type ZodControllerAndServiceEntityController from './ZodControllerAndServiceEntityController';

export default class ZodControllerAndServiceEntityService {
  static getZodControllerAndServiceEntities = (
    search: VovkQuery<typeof ZodControllerAndServiceEntityController.getZodControllerAndServiceEntities>['search']
  ) => {
    return { results: [], search };
  };

  static updateZodControllerAndServiceEntity = (
    id: string,
    q: VovkQuery<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>['q'],
    body: VovkBody<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
