import { prefix, get, put, post, del, openapi } from 'vovk';
import * as v from 'valibot';
import withValibot from '@/lib/withValibot.ts';

@prefix('valibot-controller-only-entities')
export default class ValibotControllerOnlyEntityController {
  @openapi({
    summary: 'Get ValibotControllerOnlyEntities',
  })
  @get()
  static getValibotControllerOnlyEntities = withValibot({
    query: v.object({ search: v.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return { results: [], search };
    },
  });

  @openapi({
    summary: 'Update ValibotControllerOnlyEntity',
  })
  @put('{id}')
  static updateValibotControllerOnlyEntity = withValibot({
    body: v.object({
      foo: v.union([v.literal('bar'), v.literal('baz')]),
    }),
    query: v.object({ q: v.string() }),
    params: v.object({ id: v.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    },
  });

  @post()
  static createValibotControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteValibotControllerOnlyEntity = () => {
    // ...
  };
}
