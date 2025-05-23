import { prefix, get, put, post, del } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod/v4';

@prefix('zod-controller-only-entities')
export default class ZodControllerOnlyEntityController {
  @get()
  static getZodControllerOnlyEntities = withZod({
    query: z.object({ search: z.string() }),
    handle(req) {
      const search = req.nextUrl.searchParams.get('search');

      return { results: [], search };
    },
  });

  @put(':id')
  static updateZodControllerOnlyEntity = withZod({
    body: z.object({
      foo: z.union([z.literal('bar'), z.literal('baz')]),
    }),
    query: z.object({ q: z.string() }),
    params: z.object({ id: z.string() }),
    async handle(req, params) {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    },
  });

  @post()
  static createZodControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteZodControllerOnlyEntity = () => {
    // ...
  };
}
