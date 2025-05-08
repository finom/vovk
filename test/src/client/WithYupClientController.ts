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

export const ComplaiingModel = yup.object({
  enum_value: yup.string().oneOf(['a', 'b', 'c']),
  // Number validations
  num_minimum: yup.number().min(1),
  num_maximum: yup.number().max(100),
  num_exclusiveMinimum: yup.number().moreThan(1),
  num_exclusiveMaximum: yup.number().lessThan(100),
  num_multipleOf: yup.number(), // not supported for schema emission
  num_int: yup.number().integer(),
  num_int32: yup.number().integer().max(2147483647).min(-2147483648),

  // String validations
  str_minLength: yup.string().min(3),
  str_maxLength: yup.string().max(50),
  str_pattern: yup.string().matches(/^[A-Z][a-z]*$/),
  str_email: yup.string().email(),
  str_url: yup.string().url(),
  str_uuid: yup.string().matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
  str_datetime: yup.string().datetime(),

  // Array validations
  arr_minItems: yup.array().of(yup.string()).min(1),
  arr_maxItems: yup.array().of(yup.string()).max(10),

  obj_required: yup.object({
    requiredField: yup.string().required(),
    optionalField: yup.number().optional(),
  }),
  obj_strict: yup
    .object({
      knownField: yup.string(),
    })
    .noUnknown(true),

  // Logical compositions (num, str, bool)
  logical_anyOf: yup.string().max(5) as yup.Schema<string | number | boolean>, // WARNING: not supported for schema emission

  // Intersection approximation in Yup
  logical_allOf: yup.object({
    a: yup.string().required(),
    b: yup.number().required(),
  }),
});

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
    body: yup.object({ hello: yup.string().max(5).required() }),
    query: yup.object({ search: yup.string().max(5).required() }),
    params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }),
    output: yup.object({
      body: yup.object({ hello: yup.string().max(5).required() }).required(),
      query: yup.object({ search: yup.string().max(5).required() }).required(),
      params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }).required(),
      vovkParams: yup
        .object({
          foo: yup.string().max(5).required(),
          bar: yup.string().max(5).required(),
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
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: (req) => req.vovk.query(),
  });

  @post.auto()
  static handleBody = withYup({
    body: yup.object({ hello: yup.string().max(5).required() }),
    handle: async (req) => req.vovk.body(),
  });

  @put('x/:foo/:bar/y')
  static handleParams = withYup({
    params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }),
    handle: async (req) => req.vovk.params(),
  });
  @get.auto()
  static handleNestedQuery = withYup({
    query: yup.object({
      x: yup.string().max(5).required(),
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
    output: yup.object({ hello: yup.string().max(5).required() }),
    handle: async (req) => ({ hello: req.vovk.query().helloOutput as 'world' }),
  });

  @get.auto()
  static handleStream = withYup({
    query: yup.object({ values: yup.array().of(yup.string().required()).required() }),
    iteration: yup.object({ value: yup.string().max(5).required() }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleSchemaComplaints = withYup({
    body: ComplaiingModel,
    handle: async (req) => {
      return req.json();
    },
  });

  @post.auto()
  static handleNothitng = withYup({
    handle: async () => ({ nothing: 'here' }) as const,
  });

  @post.auto()
  static handleFormData = withYup({
    body: withYup.formData,
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: async (req) => {
      const formData = await req.vovk.form<{ hello: 'world' }>();
      const search = req.vovk.query().search;
      return { formData, search };
    },
  });

  @post.auto()
  static disableServerSideValidationBool = withYup({
    disableServerSideValidation: true,
    body: yup.object({ hello: yup.string().max(5).required() }),
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });
  @post.auto()
  static disableServerSideValidationStrings = withYup({
    disableServerSideValidation: ['body'],
    body: yup.object({ hello: yup.string().max(5).required() }),
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });
  @post.auto()
  static skipSchemaEmissionBool = withYup({
    skipSchemaEmission: true,
    body: yup.object({ hello: yup.string().max(5).required() }),
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });
  @post.auto()
  static skipSchemaEmissionStrings = withYup({
    skipSchemaEmission: ['body'],
    body: yup.object({ hello: yup.string().max(5).required() }),
    query: yup.object({ search: yup.string().max(5).required() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  @post.auto()
  static validateEachIteration = withYup({
    validateEachIteration: true,
    query: yup.object({ values: yup.array().of(yup.string().required()).required() }),
    iteration: yup.object({ value: yup.string().max(5).required() }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });
}
