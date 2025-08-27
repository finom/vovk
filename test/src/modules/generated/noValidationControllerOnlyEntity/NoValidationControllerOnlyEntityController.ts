import { prefix, get, put, post, del, operation, type VovkRequest } from 'vovk';

@prefix('no-validation-controller-only-entities')
export default class NoValidationControllerOnlyEntityController {
  @operation({
    summary: 'Get NoValidationControllerOnlyEntities',
  })
  @get()
  static getNoValidationControllerOnlyEntities = async (req: VovkRequest<null, { search: string }>) => {
    const search = req.nextUrl.searchParams.get('search');

    return { results: [], search };
  };

  @operation({
    summary: 'Update NoValidationControllerOnlyEntity',
  })
  @put('{id}')
  static updateNoValidationControllerOnlyEntity = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return { id, body, q };
  };

  @post()
  static createNoValidationControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteNoValidationControllerOnlyEntity = () => {
    // ...
  };
}
