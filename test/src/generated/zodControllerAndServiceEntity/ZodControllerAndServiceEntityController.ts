import { prefix, get, put, post, del } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';

import ZodControllerAndServiceEntityService from './ZodControllerAndServiceEntityService';

@prefix('zod-controller-and-service-entity')
export default class ZodControllerAndServiceEntityController {
  @get()
  static getZodControllerAndServiceEntities = withZod(null, z.object({ q: z.string() }), (req) => {
    const q = req.nextUrl.searchParams.get('q');

    return ZodControllerAndServiceEntityService.getZodControllerAndServiceEntities(q);
  });

  @put(':id')
  static updateZodControllerAndServiceEntity = withZod(
    z.object({
      foo: z.union([z.literal('bar'), z.literal('baz')]),
    }),
    z.object({ q: z.string() }),
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return MyThingService.updateMyThingExample(id, q, body);
    }
  );

  @post()
  static createZodControllerAndServiceEntity = () => {
    // ...
  };

  @del(':id')
  static deleteZodControllerAndServiceEntity = () => {
    // ...
  };
}
