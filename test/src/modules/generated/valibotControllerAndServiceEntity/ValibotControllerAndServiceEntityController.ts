import { prefix, get, put, post, del, operation } from 'vovk';
import * as v from 'valibot';
import withValibot from '../../../lib/withValibot.ts';

import ValibotControllerAndServiceEntityService from './ValibotControllerAndServiceEntityService.ts';

@prefix('valibot-controller-and-service-entities')
export default class ValibotControllerAndServiceEntityController {
  @operation({
    summary: 'Get ValibotControllerAndServiceEntities',
  })
  @get()
  static getValibotControllerAndServiceEntities = withValibot({
    handle() {
      return ValibotControllerAndServiceEntityService.getValibotControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Update ValibotControllerAndServiceEntity',
  })
  @put('{id}')
  static updateValibotControllerAndServiceEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    params: v.object({ id: v.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();

      return ValibotControllerAndServiceEntityService.updateValibotControllerAndServiceEntity(id, body);
    },
  });

  @post()
  static createValibotControllerAndServiceEntity = withValibot({
    body: v.object({ todo: v.literal(true) }),
    async handle(req) {
      const body = await req.json();

      return ValibotControllerAndServiceEntityService.createValibotControllerAndServiceEntity(body);
    },
  });

  @del('{id}')
  static deleteValibotControllerAndServiceEntity = withValibot({
    params: v.object({ id: v.string() }),
    handle(_req, params) {
      const { id } = params;

      return ValibotControllerAndServiceEntityService.deleteValibotControllerAndServiceEntity(id);
    },
  });
}
