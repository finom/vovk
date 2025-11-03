import type { VovkBody, VovkParams } from 'vovk';
import type YupControllerAndServiceEntityController from './YupControllerAndServiceEntityController.ts';

export default class YupControllerAndServiceEntityService {
  static getYupControllerAndServiceEntities = () => {
    return { message: 'TODO: get yupControllerAndServiceEntities' };
  };

  static getSingleYupControllerAndServiceEntity = (
    id: VovkParams<typeof YupControllerAndServiceEntityController.getSingleYupControllerAndServiceEntity>['id']
  ) => {
    return { message: 'TODO: get single yupControllerAndServiceEntity', id };
  };

  static updateYupControllerAndServiceEntity = (
    id: VovkParams<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>['id'],
    body: VovkBody<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update yupControllerAndServiceEntity`, id, body };
  };

  static createYupControllerAndServiceEntity = (
    body: VovkBody<typeof YupControllerAndServiceEntityController.createYupControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create yupControllerAndServiceEntity`, body };
  };

  static deleteYupControllerAndServiceEntity = (
    id: VovkParams<typeof YupControllerAndServiceEntityController.deleteYupControllerAndServiceEntity>['id']
  ) => {
    return { message: `TODO: delete yupControllerAndServiceEntity`, id };
  };
}
