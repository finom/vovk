import type { VovkBody, VovkParams } from 'vovk';
import type ValibotControllerAndServiceEntityController from './ValibotControllerAndServiceEntityController.ts';

export default class ValibotControllerAndServiceEntityService {
  static getValibotControllerAndServiceEntities = () => {
    return { message: 'TODO: get valibotControllerAndServiceEntities' };
  };

  static updateValibotControllerAndServiceEntity = (
    id: VovkParams<typeof ValibotControllerAndServiceEntityController.updateValibotControllerAndServiceEntity>['id'],
    body: VovkBody<typeof ValibotControllerAndServiceEntityController.updateValibotControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update valibotControllerAndServiceEntity`, id, body };
  };

  static createValibotControllerAndServiceEntity = (
    body: VovkBody<typeof ValibotControllerAndServiceEntityController.createValibotControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create valibotControllerAndServiceEntity`, body };
  };

  static deleteValibotControllerAndServiceEntity = (
    id: VovkParams<typeof ValibotControllerAndServiceEntityController.deleteValibotControllerAndServiceEntity>['id']
  ) => {
    return { message: `TODO: delete valibotControllerAndServiceEntity`, id };
  };
}
