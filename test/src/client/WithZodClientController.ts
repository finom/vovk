import { post, put, get, del, prefix } from 'vovk';
import { withZod } from 'vovk-zod';
import * as z from 'zod';

@prefix('with-zod')
export default class WithZodClientController {
  @post(':foo')
  static postWithBodyQueryAndParams = withZod(
    z.object({ hello: z.literal('body') }),
    z.object({ hey: z.literal('query') }),
    async (req, params: { foo: 'bar' }) => {
      const body = await req.json();
      const hey = req.nextUrl.searchParams.get('hey');
      return { body, query: { hey }, params };
    }
  );

  @put.auto()
  static putWithBodyAndNullQuery = withZod(z.object({ hello: z.literal('body') }), null, async (req) => {
    const body = await req.json();
    return { body };
  });

  @del.auto()
  static putWithBodyOnly = withZod(z.object({ hello: z.literal('body') }), async (req) => {
    const body = await req.json();
    return { body };
  });

  @get.auto()
  static getWithQueryAndNullBody = withZod(null, z.object({ hey: z.literal('query') }), (req) => {
    const hey = req.nextUrl.searchParams.get('hey');
    return { query: { hey } };
  });
}
