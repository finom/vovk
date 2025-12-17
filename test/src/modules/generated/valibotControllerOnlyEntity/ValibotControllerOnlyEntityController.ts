import { prefix, get, put, post, del, operation } from 'vovk';
import * as v from 'valibot';
import withValibot from '../../../lib/withValibot.ts';

@prefix('valibot-controller-only-entities')
export default class ValibotControllerOnlyEntityController {
  @operation({
    summary: 'Get valibotControllerOnlyEntities',
  })
  @get()
  static getValibotControllerOnlyEntities = withValibot({
    handle() {
      return { message: 'TODO: get valibotControllerOnlyEntities' };
    },
  });

  @operation({
    summary: 'Get single valibotControllerOnlyEntity',
  })
  @get('{id}')
  static getSingleValibotControllerOnlyEntity = withValibot({
    params: v.object({ id: v.string() }),
    handle(_req, { id }) {
      return { message: `TODO: get single valibotControllerOnlyEntity`, id };
    },
  });

  @operation({
    summary: 'Update valibotControllerOnlyEntity',
  })
  @put('{id}')
  static updateValibotControllerOnlyEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    params: v.object({ id: v.string() }),
    async handle(req, { id }) {
      const body = await req.json();

      return { message: `TODO: update valibotControllerOnlyEntity`, id, body };
    },
  });

  @operation({
    summary: 'Create valibotControllerOnlyEntity',
  })
  @post()
  static createValibotControllerOnlyEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    async handle(req) {
      const body = await req.json();

      return { message: `TODO: create valibotControllerOnlyEntity`, body };
    },
  });

  @operation({
    summary: 'Delete valibotControllerOnlyEntity',
  })
  @del('{id}')
  static deleteValibotControllerOnlyEntity = withValibot({
    params: v.object({ id: v.string() }),
    handle(_req, { id }) {
      return { message: `TODO: delete valibotControllerOnlyEntity`, id };
    },
  });
}
