import { prefix, get, put, post, del, type VovkRequest } from 'vovk';

import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService';

@prefix('dto-controller-and-service-entity')
export default class DtoControllerAndServiceEntityController {
  @get()
  static getDtoControllerAndServiceEntities = async (req: VovkRequest<null, { search: string }>) => {
    const search = req.nextUrl.searchParams.get('search');

    return DtoControllerAndServiceEntityService.getDtoControllerAndServiceEntities(search);
  };

  @put(':id')
  static updateDtoControllerAndServiceEntity = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return DtoControllerAndServiceEntityService.updateDtoControllerAndServiceEntity(id, q, body);
  };

  @post()
  static createDtoControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteDtoControllerAndServiceEntity = () => {
    // ...
  };
}
