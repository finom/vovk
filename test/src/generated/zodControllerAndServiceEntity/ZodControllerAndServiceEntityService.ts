import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type ZodControllerAndServiceEntityController from './ZodControllerAndServiceEntityController';

export default class ZodControllerAndServiceEntityService {
  static getZodControllerAndServiceEntities = (
    q: VovkControllerQuery<typeof ZodControllerAndServiceEntityController.getZodControllerAndServiceEntities>['q']
  ) => {
    return [{ q }];
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
