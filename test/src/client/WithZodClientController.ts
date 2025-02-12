import { post, put, get, del, prefix, openapi } from 'vovk';
import { withZod } from 'vovk-zod';
import * as z from 'zod';

@prefix('with-zod')
export default class WithZodClientController {
  @post(':foo')
  static postWithBodyQueryAndParams = withZod({
    body: z.object({ hello: z.literal('body') }).describe('This is a body'),
    query: z.object({ hey: z.literal('query') }),
    handle: async (req, params: { foo: 'bar' }) => {
      const body = await req.json();
      const hey = req.nextUrl.searchParams.get('hey');
      return { body, query: { hey }, params };
    },
  });

  @put.auto()
  static putWithBodyAndNullQuery = withZod({
    body: z.object({ hello: z.literal('body') }),
    handle: async (req) => {
      const body = await req.json();
      return { body };
    },
  });

  @del.auto()
  static putWithBodyOnly = withZod({
    body: z.object({ hello: z.literal('body') }),
    handle: async (req) => {
      const body = await req.json();
      return { body };
    },
  });

  @get.auto()
  static getWithQueryAndNullBody = withZod({
    query: z.object({ hey: z.literal('query') }),
    handle: (req) => {
      const hey = req.nextUrl.searchParams.get('hey');
      return { query: { hey } };
    },
  });

  @get('nested-query')
  static getNestedQuery = withZod({
    query: z.object({
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
    handle: (req) => {
      return { query: req.vovk.query(), search: decodeURIComponent(req.nextUrl.search) };
    },
  });

  @get('output-and-openapi/:id')
  @openapi({
    summary: 'This is a summary',
  })
  static outputWithOpenApi = withZod({
    query: z.object({ hello: z.string() }),
    params: z.object({ id: z.string() }),
    output: z.object({ hello: z.string() }),
    handle: (req) => {
      return { hello: req.vovk.query().hello };
    },
  });
}
