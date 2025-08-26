import { prefix, get, put, post, del, describe, type VovkRequest } from 'vovk';

import NoValidationControllerAndServiceEntityService from './NoValidationControllerAndServiceEntityService.ts';

@prefix('no-validation-controller-and-service-entities')
export default class NoValidationControllerAndServiceEntityController {
  @describe({
    summary: 'Get NoValidationControllerAndServiceEntities',
  })
  @get()
  static getNoValidationControllerAndServiceEntities = async (req: VovkRequest<null, { search: string }>) => {
    const search = req.nextUrl.searchParams.get('search');

    return NoValidationControllerAndServiceEntityService.getNoValidationControllerAndServiceEntities(search);
  };

  @describe({
    summary: 'Update NoValidationControllerAndServiceEntity',
  })
  @put('{id}')
  static updateNoValidationControllerAndServiceEntity = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return NoValidationControllerAndServiceEntityService.updateNoValidationControllerAndServiceEntity(id, q, body);
  };

  @post()
  static createNoValidationControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteNoValidationControllerAndServiceEntity = () => {
    // ...
  };
}
