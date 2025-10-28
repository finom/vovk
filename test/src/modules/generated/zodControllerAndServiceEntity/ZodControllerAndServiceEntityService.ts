import type { VovkBody, VovkParams } from 'vovk';
import type ZodControllerAndServiceEntityController from './ZodControllerAndServiceEntityController.ts';

export default class ZodControllerAndServiceEntityService {
  static getZodControllerAndServiceEntities = () => {
    return { message: 'TODO: get zodControllerAndServiceEntities' };
  };

  static updateZodControllerAndServiceEntity = (
    id: VovkParams<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>['id'],
    body: VovkBody<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update zodControllerAndServiceEntity`, id, body };
  };

  static createZodControllerAndServiceEntity = (
    body: VovkBody<typeof ZodControllerAndServiceEntityController.createZodControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create zodControllerAndServiceEntity`, body };
  };

  static deleteZodControllerAndServiceEntity = (
    id: VovkParams<typeof ZodControllerAndServiceEntityController.deleteZodControllerAndServiceEntity>['id']
  ) => {
    return { message: `TODO: delete zodControllerAndServiceEntity`, id };
  };
}
