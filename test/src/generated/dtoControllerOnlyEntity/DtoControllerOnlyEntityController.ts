import { prefix, get, put, post, del, type VovkRequest } from 'vovk';

@prefix('dto-controller-only-entity')
export default class DtoControllerOnlyEntityController {
  @get()
  static getDtoControllerOnlyEntities = async (req: VovkRequest<null, { search: string }>) => {
    const search = req.nextUrl.searchParams.get('search');

    return { results: [], search };
  };

  @put(':id')
  static updateDtoControllerOnlyEntity = async (
    req: VovkRequest<{ foo: 'bar' | 'baz' }, { q: string }>,
    params: { id: string }
  ) => {
    const { id } = params;
    const body = await req.json();
    const q = req.nextUrl.searchParams.get('q');

    return { id, body, q };
  };

  @post()
  static createDtoControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteDtoControllerOnlyEntity = () => {
    // ...
  };
}
