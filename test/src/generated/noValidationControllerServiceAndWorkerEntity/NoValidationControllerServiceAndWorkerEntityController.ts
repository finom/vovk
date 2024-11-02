import { prefix, get, put, post, del, type VovkRequest } from 'vovk';

import NoValidationControllerServiceAndWorkerEntityService from './NoValidationControllerServiceAndWorkerEntityService';

@prefix('no-validation-controller-service-and-worker-entity')
export default class NoValidationControllerServiceAndWorkerEntityController {
  @get()
  static getNoValidationControllerServiceAndWorkerEntities = async (req: VovkRequest<null, { search: string }>) => {
    const search = req.nextUrl.searchParams.get('search');

    return NoValidationControllerServiceAndWorkerEntityService.getNoValidationControllerServiceAndWorkerEntities(
      search
    );
  };

  @put(':id')
  static updateNoValidationControllerServiceAndWorkerEntity = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return NoValidationControllerServiceAndWorkerEntityService.updateNoValidationControllerServiceAndWorkerEntity(
      id,
      q,
      body
    );
  };

  @post()
  static createNoValidationControllerServiceAndWorkerEntity = () => {
    // ...
  };

  @del(':id')
  static deleteNoValidationControllerServiceAndWorkerEntity = () => {
    // ...
  };
}
