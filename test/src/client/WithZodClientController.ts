import {
  post,
  put,
  get,
  prefix,
  HttpStatus,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkOutput,
} from 'vovk';
import { openapi } from 'vovk-openapi';
import { withZod } from 'vovk-zod';
import { z } from 'zod/v4';

const HandleAllInput = {
  body: z.object({ hello: z.string() }),
  query: z.object({ search: z.string() }),
  params: z.object({ foo: z.string(), bar: z.string() }),
  output: z.object({
    body: z.object({ hello: z.string() }),
    query: z.object({ search: z.string() }),
    params: z.object({ foo: z.string(), bar: z.string() }),
    vovkParams: z.object({ foo: z.string(), bar: z.string() }),
  }),
};

export const ConstrainingModel = z.object({
  enum_value: z.enum(['a', 'b', 'c']),
  // Number validations not in Rust
  num_minimum: z.number().min(1), // Minimum value (inclusive)
  num_maximum: z.number().max(100), // Maximum value (inclusive)
  num_exclusiveMinimum: z.number().gt(1), // Exclusive minimum
  num_exclusiveMaximum: z.number().lt(100), // Exclusive maximum
  num_multipleOf: z.number().multipleOf(5), // Must be multiple of value
  num_int: z.int(), // Must be an integer
  num_int32: z.int32(), // Must be an integer with max 32 bits

  // String validations not in Rust
  str_minLength: z.string().min(3), // Minimum string length
  str_maxLength: z.string().max(50), // Maximum string length
  str_pattern: z.string().regex(/^[A-Z][a-z]*$/), // Must match regex pattern
  str_email: z.email(), // Email format
  str_url: z.url(), // URL format
  str_uuid: z.uuid(), // UUID format
  str_datetime: z.iso.datetime(), // ISO datetime

  // Array validations not in Rust
  arr_minItems: z.array(z.string()).min(1), // Minimum items
  arr_maxItems: z.array(z.string()).max(10), // Maximum items

  obj_required: z.object({
    requiredField: z.string(),
    optionalField: z.number().optional(),
  }),
  obj_strict: z
    .object({
      knownField: z.string(),
    })
    .strict(), // No additional properties allowed

  // Logical compositions
  logical_anyOf: z.union([z.string().max(5), z.number(), z.boolean()]), // One of these types
  logical_allOf: z.intersection(z.looseObject({ a: z.string() }), z.looseObject({ b: z.number() })), // Must satisfy both schemas
});

// check if the "circular" types don't error
class WithZodClientService {
  static handleAll({
    body,
    query,
    params,
    vovkParams,
  }: {
    body: VovkBody<typeof WithZodClientController.handleAll>;
    query: VovkQuery<typeof WithZodClientController.handleAll>;
    params: VovkParams<typeof WithZodClientController.handleAll>;
    vovkParams: VovkParams<typeof WithZodClientController.handleAll>;
  }) {
    return { body, query, params, vovkParams } satisfies VovkOutput<typeof WithZodClientController.handleAll>;
  }
}

@prefix('with-zod')
export default class WithZodClientController {
  @openapi({
    summary: 'This is a summary',
    description: 'This is a description',
  })
  @openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/:foo/:bar')
  static handleAll = withZod({
    ...HandleAllInput,
    handle: async ({ vovk }, params) => {
      const body = await vovk.body();
      const { search } = vovk.query();
      const vovkParams = vovk.params();
      return WithZodClientService.handleAll({
        body,
        query: { search },
        params,
        vovkParams,
      });
    },
  });

  @get.auto()
  static handleQuery = withZod({
    query: z.object({ search: z.string().max(5) }),
    handle: (req) => {
      return req.vovk.query();
    },
  });

  @post.auto()
  static handleBody = withZod({
    body: z.object({ hello: z.string().max(5) }),
    handle: async (req) => {
      return req.vovk.body();
    },
  });

  @put('x/:foo/:bar/y')
  static handleParams = withZod({
    params: z.object({ foo: z.string().max(5), bar: z.string().max(5) }),
    handle: async (req) => {
      return req.vovk.params();
    },
  });

  @get.auto()
  static handleNestedQuery = withZod({
    query: z.object({
      x: z.string().max(5),
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
    output: z.object({ hello: z.string().max(5) }),
    handle: async (req) => {
      return { hello: req.vovk.query().helloOutput };
    },
  });

  @get.auto()
  static handleStream = withZod({
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleSchemaConstraints = withZod({
    body: ConstrainingModel,
    handle: async (req) => {
      return req.json();
    },
  });

  @post.auto()
  static handleNothitng = withZod({
    handle: async () => {
      return { nothing: 'here' } as const;
    },
  });

  @post.auto()
  static handleFormData = withZod({
    isForm: true,
    body: z.object({ hello: z.string().max(5), file: z.file() }),
    query: z.object({ search: z.string() }),
    handle: async (req) => {
      const formData = await req.vovk.form();
      const search = req.vovk.query().search;
      return { formData, search };
    },
  });

  @post.auto()
  static disableServerSideValidationBool = withZod({
    disableServerSideValidation: true,
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  @post.auto()
  static disableServerSideValidationStrings = withZod({
    disableServerSideValidation: ['body'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string().max(5) }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  // skipSchemaEmission
  @post.auto()
  static skipSchemaEmissionBool = withZod({
    skipSchemaEmission: true,
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });
  @post.auto()
  static skipSchemaEmissionStrings = withZod({
    skipSchemaEmission: ['body'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  @post.auto()
  static validateEachIteration = withZod({
    validateEachIteration: true,
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  static handleAllNoHTTP = withZod({
    ...HandleAllInput,
    handle: async ({ vovk }, params) => {
      const body = await vovk.body();
      const { search } = vovk.query();
      const vovkParams = vovk.params();
      return WithZodClientService.handleAll({
        body,
        query: { search },
        params,
        vovkParams,
      });
    },
  });

  @post('all-as-func/:foo/:bar')
  static handleAllAsFunction = withZod({
    ...HandleAllInput,
    disableServerSideValidation: true,
    async handle(req, params) {
      return WithZodClientController.handleAll.func({
        body: await req.vovk.body(),
        query: req.vovk.query(),
        params,
      });
    },
  });

  @post('all-no-http-as-func/:foo/:bar')
  static handleAllNoHttpAsFunction = withZod({
    ...HandleAllInput,
    disableServerSideValidation: true,
    async handle(req, params) {
      return WithZodClientController.handleAllNoHTTP.func({
        body: await req.vovk.body(),
        query: req.vovk.query(),
        params,
      });
    },
  });
}
