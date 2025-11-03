import { prefix, get, put, post, del, operation } from 'vovk';
import * as v from 'valibot';
import withValibot from '../../../lib/withValibot.ts';

@prefix('valibot-controller-only-entities')
export default class ValibotControllerOnlyEntityController {
  @operation({
    summary: 'Get ValibotControllerOnlyEntities',
  })
  @get()
  static getValibotControllerOnlyEntities = withValibot({
    handle() {
      return { message: 'TODO: get valibotControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Update ValibotControllerOnlyEntity',
  })
  @put('{id}')
  static updateValibotControllerOnlyEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    params: v.object({ id: v.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();

      return { message: `TODO: update valibotControllerOnlyEntity`, id, body };
    },
  });

  @post()
  static createValibotControllerOnlyEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create valibotControllerOnlyEntity`, body };
    },
  });

  @del('{id}')
  static deleteValibotControllerOnlyEntity = withValibot({
    params: v.object({ id: v.string() }),
    handle(_req, params) {
      const { id } = params;

      return { message: `TODO: delete valibotControllerOnlyEntity`, id };
    },
  });
}
