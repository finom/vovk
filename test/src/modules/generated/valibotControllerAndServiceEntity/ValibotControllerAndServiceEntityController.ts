import { prefix, get, put, post, del, describe } from 'vovk';
import * as v from 'valibot';
import withValibot from '@/lib/withValibot.ts';

import ValibotControllerAndServiceEntityService from './ValibotControllerAndServiceEntityService.ts';

@prefix('valibot-controller-and-service-entities')
export default class ValibotControllerAndServiceEntityController {
  @describe({
    summary: 'Get ValibotControllerAndServiceEntities',
  })
  @get()
  static getValibotControllerAndServiceEntities = withValibot({
    query: v.object({ search: v.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return ValibotControllerAndServiceEntityService.getValibotControllerAndServiceEntities(search);
    },
  });

  @describe({
    summary: 'Update ValibotControllerAndServiceEntity',
  })
  @put('{id}')
  static updateValibotControllerAndServiceEntity = withValibot({
    body: v.object({
      foo: v.union([v.literal('bar'), v.literal('baz')]),
    }),
    query: v.object({ q: v.string() }),
    params: v.object({ id: v.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return ValibotControllerAndServiceEntityService.updateValibotControllerAndServiceEntity(id, q, body);
    },
  });

  @post()
  static createValibotControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteValibotControllerAndServiceEntity = () => {
    // ...
  };
}
