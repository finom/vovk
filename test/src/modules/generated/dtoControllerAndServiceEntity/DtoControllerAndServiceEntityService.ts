import type { VovkBody, VovkParams } from 'vovk';
import type DtoControllerAndServiceEntityController from './DtoControllerAndServiceEntityController.ts';

export default class DtoControllerAndServiceEntityService {
  static getDtoControllerAndServiceEntities = () => {
    return { message: 'TODO: get dtoControllerAndServiceEntities' };
  };

  static updateDtoControllerAndServiceEntity = (
    id: VovkParams<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>['id'],
    body: VovkBody<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>
  ) => {
    return { message: `TODO: update dtoControllerAndServiceEntity`, id, body };
  };

  static createDtoControllerAndServiceEntity = (
    body: VovkBody<typeof DtoControllerAndServiceEntityController.createDtoControllerAndServiceEntity>
  ) => {
    return { message: `TODO: create dtoControllerAndServiceEntity`, body };
  };

  static deleteDtoControllerAndServiceEntity = (
    id: VovkParams<typeof DtoControllerAndServiceEntityController.deleteDtoControllerAndServiceEntity>['id']
  ) => {
    return { message: `TODO: delete dtoControllerAndServiceEntity`, id };
  };
}
