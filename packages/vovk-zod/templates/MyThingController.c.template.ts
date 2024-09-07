import { prefix, get, put, post, del } from 'vovk';
import { z } from 'zod';
import { withZod } from 'vovk-zod';
import MyThingService from './MyThingService.s.template';

@prefix('my-thing')
export default class MyThingController {
  @get()
  static getMyThingsExample = withZod(null, z.object({ q: z.string() }), (req) => {
    const q = req.nextUrl.searchParams.get('q');

    return MyThingService.getMyThingsExample(q);
  });

  @put(':id')
  static updateMyThingExample = withZod(
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
  static async createMyThingExample() {
    // ...
  }

  @del(':id')
  static deleteMyThingExample() {
    // ...
  }
}
