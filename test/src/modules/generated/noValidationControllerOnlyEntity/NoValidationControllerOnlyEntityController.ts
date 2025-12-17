import { prefix, get, put, post, del, operation, type VovkRequest } from 'vovk';

@prefix('no-validation-controller-only-entities')
export default class NoValidationControllerOnlyEntityController {
  @operation({
    summary: 'Get noValidationControllerOnlyEntities',
  })
  @get()
  static getNoValidationControllerOnlyEntities = () => {
    return { message: 'TODO: get noValidationControllerOnlyEntities' };
  };

  @operation({
    summary: 'Get single noValidationControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleNoValidationControllerOnlyEntity = (_req: VovkRequest, { id }: { id: string }) => {
    return { message: 'TODO: get single noValidationControllerOnlyEntity', id };
  };

  @operation({
    summary: 'Update noValidationControllerOnlyEntity',
  })
  @put('{id}')
  static updateNoValidationControllerOnlyEntity = async (req: VovkRequest<{ todo: true }>, params: { id: string }) => {
    const { id } = params;
    const body = await req.json();

    return { message: `TODO: update noValidationControllerOnlyEntity`, id, body };
  };

  @operation({
    summary: 'Create noValidationControllerOnlyEntity',
  })
  @post()
  static createNoValidationControllerOnlyEntity = async (req: VovkRequest<{ todo: true }>) => {
    const body = await req.json();

    return { message: `TODO: create noValidationControllerOnlyEntity`, body };
  };

  @operation({
    summary: 'Delete noValidationControllerOnlyEntity',
  })
  @del('{id}')
  static deleteNoValidationControllerOnlyEntity = (_req: VovkRequest, params: { id: string }) => {
    const { id } = params;

    return { message: `TODO: delete noValidationControllerOnlyEntity`, id };
  };
}
