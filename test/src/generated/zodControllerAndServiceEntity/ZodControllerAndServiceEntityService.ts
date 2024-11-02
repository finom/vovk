import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type ZodControllerAndServiceEntityController from './ZodControllerAndServiceEntityController';

export default class ZodControllerAndServiceEntityService {
  static getZodControllerAndServiceEntities = (
    search: VovkControllerQuery<
      typeof ZodControllerAndServiceEntityController.getZodControllerAndServiceEntities
    >['search']
  ) => {
    return { results: [], search };
  };

  static updateZodControllerAndServiceEntity = (
    id: string,
    q: VovkControllerQuery<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>['q'],
    body: VovkControllerBody<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>
  ) => {
    return { id, q, body };
  };

  // ...
}
