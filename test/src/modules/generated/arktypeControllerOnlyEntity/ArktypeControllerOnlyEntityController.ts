import { prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import withArk from '@/lib/withArk.ts';

@prefix('arktype-controller-only-entities')
export default class ArktypeControllerOnlyEntityController {
  @operation({
    summary: 'Get ArktypeControllerOnlyEntities',
  })
  @get()
  static getArktypeControllerOnlyEntities = withArk({
    query: type({ search: type('string') }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return { results: [], search };
    },
  });

  @operation({
    summary: 'Update ArktypeControllerOnlyEntity',
  })
  @put('{id}')
  static updateArktypeControllerOnlyEntity = withArk({
    body: type({
      foo: type('"bar" | "baz"'),
    }),
    query: type({ q: type('string') }),
    params: type({ id: type('string') }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    },
  });

  @post()
  static createArktypeControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteArktypeControllerOnlyEntity = () => {
    // ...
  };
}
