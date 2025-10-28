import { prefix, get, put, post, del, operation } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';

import ZodControllerAndServiceEntityService from './ZodControllerAndServiceEntityService.ts';

@prefix('zod-controller-and-service-entities')
export default class ZodControllerAndServiceEntityController {
  @operation({
    summary: 'Get ZodControllerAndServiceEntities',
  })
  @get()
  static getZodControllerAndServiceEntities = withZod({
    handle() {
      return ZodControllerAndServiceEntityService.getZodControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Update ZodControllerAndServiceEntity',
  })
  @put('{id}')
  static updateZodControllerAndServiceEntity = withZod({
    body: z.object({
      todo: z.literal(true),
    }),
    params: z.object({ id: z.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();

      return ZodControllerAndServiceEntityService.updateZodControllerAndServiceEntity(id, body);
    },
  });

  @post()
  static createZodControllerAndServiceEntity = withZod({
    body: z.object({
      todo: z.literal(true),
    }),
    async handle(req) {
      const body = await req.json();

      return ZodControllerAndServiceEntityService.createZodControllerAndServiceEntity(body);
    },
  });

  @del('{id}')
  static deleteZodControllerAndServiceEntity = withZod({
    params: z.object({
      id: z.string(),
    }),
    handle(req, params) {
      const { id } = params;

      return ZodControllerAndServiceEntityService.deleteZodControllerAndServiceEntity(id);
    },
  });
}
