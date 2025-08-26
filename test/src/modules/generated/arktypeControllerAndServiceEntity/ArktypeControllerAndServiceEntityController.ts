import { prefix, get, put, post, del, operation } from 'vovk';
import { type } from 'arktype';
import withArk from '@/lib/withArk.ts';

import ArktypeControllerAndServiceEntityService from './ArktypeControllerAndServiceEntityService.ts';

@prefix('arktype-controller-and-service-entities')
export default class ArktypeControllerAndServiceEntityController {
  @operation({
    summary: 'Get ArktypeControllerAndServiceEntities',
  })
  @get()
  static getArktypeControllerAndServiceEntities = withArk({
    query: type({ search: type('string') }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return ArktypeControllerAndServiceEntityService.getArktypeControllerAndServiceEntities(search);
    },
  });

  @operation({
    summary: 'Update ArktypeControllerAndServiceEntity',
  })
  @put('{id}')
  static updateArktypeControllerAndServiceEntity = withArk({
    body: type({
      foo: type('"bar" | "baz"'),
    }),
    query: type({ q: type('string') }),
    params: type({ id: type('string') }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return ArktypeControllerAndServiceEntityService.updateArktypeControllerAndServiceEntity(id, q, body);
    },
  });

  @post()
  static createArktypeControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteArktypeControllerAndServiceEntity = () => {
    // ...
  };
}
