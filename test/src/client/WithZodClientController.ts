import { post, put, get, del, prefix, openapi } from 'vovk';
import { withZod } from 'vovk-zod';
import * as z from 'zod';

@prefix('with-zod')
export default class WithZodClientController {
  @post(':foo')
  static postWithBodyQueryAndParams = withZod(
    z.object({ hello: z.literal('body') }).describe('This is a body'),
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

  @get('nested-query')
  static getNestedQuery = withZod(
    null,
    z.object({
      x: z.string(),
      y: z.array(z.string()),
      z: z.object({
        f: z.string(),
        u: z.array(z.string()),
        d: z.object({
          x: z.string(),
          arrOfObjects: z.array(
            z.object({
              foo: z.string(),
              nestedArr: z.array(z.string()).optional(),
              nestedObj: z
                .object({
                  deepKey: z.string(),
                })
                .optional(),
            })
          ),
        }),
      }),
    }),
    (req) => {
      return { query: req.vovk.query(), search: decodeURIComponent(req.nextUrl.search) };
    }
  );

  @get('output-and-openapi')
  @openapi({
    summary: 'This is a summary',
  })
  static outputWithOpenApi = withZod(null, z.object({ hello: z.string() }), z.object({ hello: z.string() }), (req) => {
    return { hello: req.vovk.query().hello };
  });
}
