import { prefix, get, put, post, del, operation, type VovkRequest } from 'vovk';

import NoValidationControllerAndServiceEntityService from './NoValidationControllerAndServiceEntityService.ts';

@prefix('no-validation-controller-and-service-entities')
export default class NoValidationControllerAndServiceEntityController {
  @operation({
    summary: 'Get NoValidationControllerAndServiceEntities',
  })
  @get()
  static getNoValidationControllerAndServiceEntities = () => {
    return NoValidationControllerAndServiceEntityService.getNoValidationControllerAndServiceEntities();
  };

  @operation({
    summary: 'Update NoValidationControllerAndServiceEntity',
  })
  @put('{id}')
  static updateNoValidationControllerAndServiceEntity = async (
    req: VovkRequest<{ todo: true }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();

    return NoValidationControllerAndServiceEntityService.updateNoValidationControllerAndServiceEntity(id, body);
  };

  @post()
  static createNoValidationControllerAndServiceEntity = async (req: VovkRequest<{ todo: true }>) => {
    const body = await req.json();

    return NoValidationControllerAndServiceEntityService.createNoValidationControllerAndServiceEntity(body);
  };

  @del('{id}')
  static deleteNoValidationControllerAndServiceEntity = (_req: VovkRequest<unknown>, params: { id: string }) => {
    const { id } = params;

    return NoValidationControllerAndServiceEntityService.deleteNoValidationControllerAndServiceEntity(id);
  };
}
