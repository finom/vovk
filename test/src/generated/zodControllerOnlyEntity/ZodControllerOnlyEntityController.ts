import { prefix, get, put, post, del } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';

@prefix('zod-controller-only-entity')
export default class ZodControllerOnlyEntityController {
  @get()
  static getZodControllerOnlyEntities = withZod(null, z.object({ search: z.string() }), (req) => {
    const search = req.nextUrl.searchParams.get('search');

    return { results: [], search };
  });

  @put(':id')
  static updateZodControllerOnlyEntity = withZod(
    z.object({
      foo: z.union([z.literal('bar'), z.literal('baz')]),
    }),
    z.object({ q: z.string() }),
    async (req, params: { id: string }) => {
      const { id } = params;
      const body = await req.json();
      const q = req.nextUrl.searchParams.get('q');

      return { id, body, q };
    }
  );

  @post()
  static createZodControllerOnlyEntity = () => {
    // ...
  };

  @del(':id')
  static deleteZodControllerOnlyEntity = () => {
    // ...
  };
}
