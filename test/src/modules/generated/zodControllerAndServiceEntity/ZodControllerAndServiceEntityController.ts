import { prefix, get, put, post, del, openapi } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod/v4';

import ZodControllerAndServiceEntityService from './ZodControllerAndServiceEntityService.ts';

@prefix('zod-controller-and-service-entities')
export default class ZodControllerAndServiceEntityController {
  @openapi({
    summary: 'Get ZodControllerAndServiceEntities',
  })
  @get()
  static getZodControllerAndServiceEntities = withZod({
    query: z.object({ search: z.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return ZodControllerAndServiceEntityService.getZodControllerAndServiceEntities(search);
    },
  });

  @openapi({
    summary: 'Update ZodControllerAndServiceEntity',
  })
  @put('{id}')
  static updateZodControllerAndServiceEntity = withZod({
    body: z.object({
      foo: z.union([z.literal('bar'), z.literal('baz')]),
    }),
    query: z.object({ q: z.string() }),
    params: z.object({ id: z.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return ZodControllerAndServiceEntityService.updateZodControllerAndServiceEntity(id, q, body);
    },
  });

  @post()
  static createZodControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteZodControllerAndServiceEntity = () => {
    // ...
  };
}
