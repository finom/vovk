import { endpoint, prefix, get, put, post, del, operation } from 'vovk';
import * as v from 'valibot';
import { toStandardJsonSchema } from '@valibot/to-json-schema';

import ValibotControllerAndServiceEntityService from './ValibotControllerAndServiceEntityService.ts';

@prefix('valibot-controller-and-service-entities')
export default class ValibotControllerAndServiceEntityController {
  @operation({
    summary: 'Get valibotControllerAndServiceEntities',
  })
  @get()
  static getValibotControllerAndServiceEntities = endpoint({
    handle() {
      return ValibotControllerAndServiceEntityService.getValibotControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Get single valibotControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleValibotControllerAndServiceEntity = endpoint({
    params: toStandardJsonSchema(v.object({ id: v.string() })),
    handle(_req, { id }) {
      return ValibotControllerAndServiceEntityService.getSingleValibotControllerAndServiceEntity(id);
    },
  });

  @operation({
    summary: 'Update valibotControllerAndServiceEntity',
  })
  @put('{id}')
  static updateValibotControllerAndServiceEntity = endpoint({
    body: toStandardJsonSchema(v.object({ todo: v.literal(true) })),
    params: toStandardJsonSchema(v.object({ id: v.string() })),
    async handle(req, { id }) {
      const body = await req.json();

      return ValibotControllerAndServiceEntityService.updateValibotControllerAndServiceEntity(id, body);
    },
  });

  @operation({
    summary: 'Create valibotControllerAndServiceEntity',
  })
  @post()
  static createValibotControllerAndServiceEntity = endpoint({
    body: toStandardJsonSchema(v.object({ todo: v.literal(true) })),
    async handle(req) {
      const body = await req.json();

      return ValibotControllerAndServiceEntityService.createValibotControllerAndServiceEntity(body);
    },
  });

  @operation({
    summary: 'Delete valibotControllerAndServiceEntity',
  })
  @del('{id}')
  static deleteValibotControllerAndServiceEntity = endpoint({
    params: toStandardJsonSchema(v.object({ id: v.string() })),
    handle(_req, { id }) {
      return ValibotControllerAndServiceEntityService.deleteValibotControllerAndServiceEntity(id);
    },
  });
}
