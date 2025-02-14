import { post, put, get, prefix, HttpStatus } from 'vovk';
import { openapi } from 'vovk-openapi';
import { withZod } from 'vovk-zod';
import * as z from 'zod';

@prefix('with-zod')
export default class WithZodClientController {
  @openapi({
    summary: 'This is a summary',
  })
  @openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/:foo')
  static handleAll = withZod({
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
    params: z.object({ foo: z.literal('bar') }),
    output: z.object({
      body: z.object({ hello: z.literal('world') }),
      query: z.object({ search: z.literal('value') }),
      params: z.object({ foo: z.literal('bar') }),
    }),
    handle: async (req, params) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, query: { search }, params };
    },
  });

  @get.auto()
  static handleQuery = withZod({
    query: z.object({ search: z.literal('value') }),
    handle: (req) => {
      return req.vovk.query();
    },
  });

  @post.auto()
  static handleBody = withZod({
    body: z.object({ hello: z.literal('world') }),
    handle: async (req) => {
      return req.vovk.body();
    },
  });

  @put('x/:foo/y')
  static handleParams = withZod({
    params: z.object({ foo: z.literal('bar') }),
    handle: async (req) => {
      return req.vovk.params();
    },
  });

  @get.auto()
  static handleNestedQuery = withZod({
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
      return req.vovk.query();
    },
  });

  @get.auto()
  static handleOutput = withZod({
    query: z.object({ helloOutput: z.string() }),
    output: z.object({ hello: z.literal('world') }),
    handle: async (req) => {
      return { hello: req.vovk.query().helloOutput as 'world' };
    },
  });

  @get.auto()
  static handleStream = withZod({
    query: z.object({ values: z.string().array() }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleNothitng = withZod({
    handle: async () => {
      return { nothing: 'here' } as const;
    },
  });
}
