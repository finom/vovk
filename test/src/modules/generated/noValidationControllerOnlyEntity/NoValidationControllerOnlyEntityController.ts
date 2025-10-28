import { prefix, get, put, post, del, operation, type VovkRequest } from 'vovk';

@prefix('no-validation-controller-only-entities')
export default class NoValidationControllerOnlyEntityController {
  @operation({
    summary: 'Get NoValidationControllerOnlyEntities',
  })
  @get()
  static getNoValidationControllerOnlyEntities = () => {
    return { message: 'TODO: get noValidationControllerOnlyEntities' };
  };

  @operation({
    summary: 'Update NoValidationControllerOnlyEntity',
  })
  @put('{id}')
  static updateNoValidationControllerOnlyEntity = async (req: VovkRequest<{ todo: true }>, params: { id: string }) => {
    const { id } = params;
    const body = await req.json();

    return { message: `TODO: update noValidationControllerOnlyEntity`, id, body };
  };

  @post()
  static createNoValidationControllerOnlyEntity = async (req: VovkRequest<{ todo: true }>) => {
    const body = await req.json();

    return { message: `TODO: create noValidationControllerOnlyEntity`, body };
  };

  @del('{id}')
  static deleteNoValidationControllerOnlyEntity = (_req: VovkRequest<unknown>, params: { id: string }) => {
    const { id } = params;

    return { message: `TODO: delete noValidationControllerOnlyEntity`, id };
  };
}
