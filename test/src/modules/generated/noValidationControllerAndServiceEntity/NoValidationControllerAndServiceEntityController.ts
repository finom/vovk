import { prefix, get, put, post, del, operation, type VovkRequest } from 'vovk';

import NoValidationControllerAndServiceEntityService from './NoValidationControllerAndServiceEntityService.ts';

@prefix('no-validation-controller-and-service-entities')
export default class NoValidationControllerAndServiceEntityController {
  @operation({
    summary: 'Get noValidationControllerAndServiceEntities',
  })
  @get()
  static getNoValidationControllerAndServiceEntities = () => {
    return NoValidationControllerAndServiceEntityService.getNoValidationControllerAndServiceEntities();
  };

  @operation({
    summary: 'Get single noValidationControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleNoValidationControllerAndServiceEntity = (_req: VovkRequest, { id }: { id: string }) => {
    return NoValidationControllerAndServiceEntityService.getSingleNoValidationControllerAndServiceEntity(id);
  };

  @operation({
    summary: 'Update noValidationControllerAndServiceEntity',
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

  @operation({
    summary: 'Create noValidationControllerAndServiceEntity',
  })
  @post()
  static createNoValidationControllerAndServiceEntity = async (req: VovkRequest<{ todo: true }>) => {
    const body = await req.json();

    return NoValidationControllerAndServiceEntityService.createNoValidationControllerAndServiceEntity(body);
  };

  @operation({
    summary: 'Delete noValidationControllerAndServiceEntity',
  })
  @del('{id}')
  static deleteNoValidationControllerAndServiceEntity = (_req: VovkRequest, params: { id: string }) => {
    const { id } = params;

    return NoValidationControllerAndServiceEntityService.deleteNoValidationControllerAndServiceEntity(id);
  };
}
