import type { VovkBody, VovkParams } from 'vovk';
import type ArktypeControllerAndServiceEntityController from './ArktypeControllerAndServiceEntityController.ts';

export default class ArktypeControllerAndServiceEntityService {
  static getArktypeControllerAndServiceEntities = () => {
    return { message: 'TODO: get arktypeControllerAndServiceEntities' };
  };

  static getSingleArktypeControllerAndServiceEntity = (
    id: VovkParams<typeof ArktypeControllerAndServiceEntityController.getSingleArktypeControllerAndServiceEntity>['id']
  ) => {
    return { message: 'TODO: get single arktypeControllerAndServiceEntity', id };
  };

  static updateArktypeControllerAndServiceEntity = (
    id: VovkParams<typeof ArktypeControllerAndServiceEntityController.updateArktypeControllerAndServiceEntity>['id'],
    body: VovkBody<typeof ArktypeControllerAndServiceEntityController.updateArktypeControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update arktypeControllerAndServiceEntity`, id, body };
  };

  static createArktypeControllerAndServiceEntity = (
    body: VovkBody<typeof ArktypeControllerAndServiceEntityController.createArktypeControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create arktypeControllerAndServiceEntity`, body };
  };

  static deleteArktypeControllerAndServiceEntity = (
    id: VovkParams<typeof ArktypeControllerAndServiceEntityController.deleteArktypeControllerAndServiceEntity>['id']
  ) => {
    return { message: `TODO: delete arktypeControllerAndServiceEntity`, id };
  };
}
