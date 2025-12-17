import { endpoint, prefix, get, put, post, del, operation } from 'vovk';
import { z } from 'zod';

import ZodControllerAndServiceEntityService from './ZodControllerAndServiceEntityService.ts';

@prefix('zod-controller-and-service-entities')
export default class ZodControllerAndServiceEntityController {
  @operation({
    summary: 'Get zodControllerAndServiceEntities',
  })
  @get()
  static getZodControllerAndServiceEntities = endpoint({
    handle() {
      return ZodControllerAndServiceEntityService.getZodControllerAndServiceEntities();
    },
  });

  @operation({
    summary: 'Get single zodControllerAndServiceEntity',
  })
  @get('{id}')
  static getSingleZodControllerAndServiceEntity = endpoint({
    params: z.object({
      id: z.string(),
    }),
    handle(_req, { id }) {
      return ZodControllerAndServiceEntityService.getSingleZodControllerAndServiceEntity(id);
    },
  });

  @operation({
    summary: 'Update zodControllerAndServiceEntity',
  })
  @put('{id}')
  static updateZodControllerAndServiceEntity = endpoint({
    body: z.object({
      todo: z.literal(true),
    }),
    params: z.object({ id: z.string() }),
    async handle(req, { id }) {
      const body = await req.json();

      return ZodControllerAndServiceEntityService.updateZodControllerAndServiceEntity(id, body);
    },
  });

  @operation({
    summary: 'Create zodControllerAndServiceEntity',
  })
  @post()
  static createZodControllerAndServiceEntity = endpoint({
    body: z.object({
      todo: z.literal(true),
    }),
    async handle(req) {
      const body = await req.json();

      return ZodControllerAndServiceEntityService.createZodControllerAndServiceEntity(body);
    },
  });

  @operation({
    summary: 'Delete zodControllerAndServiceEntity',
  })
  @del('{id}')
  static deleteZodControllerAndServiceEntity = endpoint({
    params: z.object({
      id: z.string(),
    }),
    handle(req, { id }) {
      return ZodControllerAndServiceEntityService.deleteZodControllerAndServiceEntity(id);
    },
  });
}
