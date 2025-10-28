import type { VovkBody, VovkParams } from 'vovk';
import type NoValidationControllerAndServiceEntityController from './NoValidationControllerAndServiceEntityController.ts';

export default class NoValidationControllerAndServiceEntityService {
  static getNoValidationControllerAndServiceEntities = () => {
    return { message: 'TODO: get noValidationControllerAndServiceEntities' };
  };

  static updateNoValidationControllerAndServiceEntity = (
    id: VovkParams<
      typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity
    >['id'],
    body: VovkBody<typeof NoValidationControllerAndServiceEntityController.updateNoValidationControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update noValidationControllerAndServiceEntity`, id, body };
  };

  static createNoValidationControllerAndServiceEntity = (
    body: VovkBody<typeof NoValidationControllerAndServiceEntityController.createNoValidationControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create noValidationControllerAndServiceEntity`, body };
  };

  static deleteNoValidationControllerAndServiceEntity = (
    id: VovkParams<
      typeof NoValidationControllerAndServiceEntityController.deleteNoValidationControllerAndServiceEntity
    >['id']
  ) => {
    return { message: `TODO: delete noValidationControllerAndServiceEntity`, id };
  };
}
