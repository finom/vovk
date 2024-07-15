import { post } from 'vovk';
import withZod from 'vovk-zod';
import * as z from 'zod';

export default class WithZodClientController {
  @post.auto()
  static postFormData = withZod(null, z.object({ hello: z.string() }), async (req) => {
    const hello = req.nextUrl.searchParams.get('hello');
    const data = await req.formData();
    const formData = Object.fromEntries(data.entries());

    return { query: { hello }, formData };
  });

  @post.auto()
  static postWithZodValidation = withZod(
    z.object({ hello: z.literal('body') }),
    z.object({ hey: z.literal('query') }),
    async (req) => {
      const body = await req.json();
      const hey = req.nextUrl.searchParams.get('hey');
      return { body, query: { hey } };
    }
  );
}
