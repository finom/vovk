import {
  post,
  put,
  get,
  prefix,
  HttpStatus,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerOutput,
} from 'vovk';
import { openapi } from 'vovk-openapi';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';
  
// check if the "circular" types don't error 
class WithYupClientService {
  static handleAll({
    body,
    query,
    params,
    vovkParams,
  }: {
    body: VovkControllerBody<typeof WithYupClientController.handleAll>;
    query: VovkControllerQuery<typeof WithYupClientController.handleAll>;
    params: VovkControllerParams<typeof WithYupClientController.handleAll>;
    vovkParams: VovkControllerParams<typeof WithYupClientController.handleAll>;
  }) {
    return { body, query, params, vovkParams } satisfies VovkControllerOutput<typeof WithYupClientController.handleAll>;
  }
}

@prefix('with-yup')
export default class WithYupClientController {
  @openapi({
    summary: 'This is a summary',
  })
  @openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/:foo/:bar')
  static handleAll = withYup({
    body: yup.object({ hello: yup.string().oneOf(['world']).required() }),
    query: yup.object({ search: yup.string().oneOf(['value']).required() }),
    params: yup.object({ foo: yup.string().oneOf(['foo']).required(), bar: yup.string().oneOf(['bar']).required() }),
    output: yup.object({
      body: yup.object({ hello: yup.string().oneOf(['world']).required() }).required(),
      query: yup.object({ search: yup.string().oneOf(['value']).required() }).required(),
      params: yup
        .object({ foo: yup.string().oneOf(['foo']).required(), bar: yup.string().oneOf(['bar']).required() })
        .required(),
      vovkParams: yup
        .object({
          foo: yup.string().oneOf(['foo']).required(),
          bar: yup.string().oneOf(['bar']).required(),
        })
        .required(),
    }),
    handle: async (req, params) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      const vovkParams = req.vovk.params();
      return WithYupClientService.handleAll({
        body,
        query: { search },
        params,
        vovkParams,
      });
    },
  });

  @get.auto()
  static handleQuery = withYup({
    query: yup.object({ search: yup.string().oneOf(['value']).required() }),
    handle: (req) => req.vovk.query(),
  });

  @post.auto()
  static handleBody = withYup({
    body: yup.object({ hello: yup.string().oneOf(['world']).required() }),
    handle: async (req) => req.vovk.body(),
  });

  @put('x/:foo/:bar/y')
  static handleParams = withYup({
    params: yup.object({ foo: yup.string().oneOf(['foo']).required(), bar: yup.string().oneOf(['bar']).required() }),
    handle: async (req) => req.vovk.params(),
  });
  // todo:  sss ss ss 
  @get.auto()
  static handleNestedQuery = withYup({
    query: yup.object({
      x: yup.string().required(),
      y: yup.array().of(yup.string().required()).required(),
      z: yup
        .object({
          f: yup.string().required(),
          u: yup.array().of(yup.string().required()).required(),
          d: yup
            .object({
              x: yup.string().required(),
              arrOfObjects: yup
                .array()
                .of(
                  yup.object({
                    foo: yup.string().required(),
                    nestedArr: yup.array().of(yup.string()).optional(),
                    nestedObj: yup
                      .object({
                        deepKey: yup.string().optional(),
                      })
                      .optional(),
                  })
                )
                .required(),
            })
            .required(),
        })
        .required(),
    }),
    handle: (req) => req.vovk.query(),
  });

  @get.auto()
  static handleOutput = withYup({
    query: yup.object({ helloOutput: yup.string().required() }),
    output: yup.object({ hello: yup.string().oneOf(['world']).required() }),
    handle: async (req) => ({ hello: req.vovk.query().helloOutput as 'world' }),
  });

  @get.auto()
  static handleStream = withYup({
    query: yup.object({ values: yup.array().of(yup.string().required()).required() }),
    iteration: yup.object({ value: yup.string().oneOf(['a', 'b', 'c', 'd']).required() }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleNothitng = withYup({
    handle: async () => ({ nothing: 'here' }) as const,
  });
}
