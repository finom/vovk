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
import { withZod } from 'vovk-zod';
import * as z from 'zod';

// check if the "circular" types don't error
class WithZodClientService {
  static handleAll({
    body,
    query,
    params,
    vovkParams,
  }: {
    body: VovkControllerBody<typeof WithZodClientController.handleAll>;
    query: VovkControllerQuery<typeof WithZodClientController.handleAll>;
    params: VovkControllerParams<typeof WithZodClientController.handleAll>;
    vovkParams: VovkControllerParams<typeof WithZodClientController.handleAll>;
  }) {
    return { body, query, params, vovkParams } satisfies VovkControllerOutput<typeof WithZodClientController.handleAll>;
  }
}

@prefix('with-zod')
export default class WithZodClientController {
  @openapi({
    summary: 'This is a summary',
  })
  @openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/:foo/:bar')
  static handleAll = withZod({
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
    params: z.object({ foo: z.literal('foo'), bar: z.literal('bar') }),
    output: z.object({
      body: z.object({ hello: z.literal('world') }),
      query: z.object({ search: z.literal('value') }),
      params: z.object({ foo: z.literal('foo'), bar: z.literal('bar') }),
      vovkParams: z.object({ foo: z.literal('foo'), bar: z.literal('bar') }),
    }),
    handle: async (req, params) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      const vovkParams = req.vovk.params();
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

  @put('x/:foo/:bar/y')
  static handleParams = withZod({
    params: z.object({ foo: z.literal('foo'), bar: z.literal('bar') }),
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
    iteration: z.object({ value: z.union([z.literal('a'), z.literal('b'), z.literal('c'), z.literal('d')]) }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });

  @post.auto()
  static handleSchemaComplains = withZod({
    body: z.object({
      // Number validations not in Rust
      numbers: z.object({
        minimum: z.number().min(0), // Minimum value (inclusive)
        maximum: z.number().max(100), // Maximum value (inclusive)
        exclusiveMinimum: z.number().gt(0), // Exclusive minimum
        exclusiveMaximum: z.number().lt(100), // Exclusive maximum
        multipleOf: z.number().multipleOf(5), // Must be multiple of value
        integerOnly: z.number().int(), // Must be an integer
      }),

      // String validations not in Rust
      strings: z.object({
        minLength: z.string().min(3), // Minimum string length
        maxLength: z.string().max(50), // Maximum string length
        pattern: z.string().regex(/^[A-Z][a-z]*$/), // Must match regex pattern
        email: z.string().email(), // Email format
        url: z.string().url(), // URL format
        uuid: z.string().uuid(), // UUID format
        datetime: z.string().datetime(), // ISO datetime
      }),

      // Array validations not in Rust
      arrays: z.object({
        minItems: z.array(z.string()).min(1), // Minimum items
        maxItems: z.array(z.string()).max(10), // Maximum items
        nonemptyArray: z.array(z.number()).nonempty(), // Must have at least one item
        // uniqueItems is handled differently in JSON Schema
      }),

      // Object validations not in Rust
      objects: z.object({
        required: z.object({
          requiredField: z.string(),
          optionalField: z.number().optional(),
        }),
        additionalPropertiesControl: z
          .object({
            knownField: z.string(),
          })
          .strict(), // No additional properties allowed
      }),

      // Logical compositions
      logical: z.object({
        oneOf: z.union([z.string(), z.number(), z.boolean()]),
        allOf: z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })),
      }),
    }),
    handle: async () => {
      // do nothing
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
    body: withZod.formData,
    query: z.object({ search: z.literal('foo') }),
    handle: async (req) => {
      const formData = await req.vovk.form<{ hello: 'world' }>();
      const search = req.vovk.query().search;
      return { formData, search };
    },
  });

  @post.auto()
  static disableServerSideValidationBool = withZod({
    disableServerSideValidation: true,
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  @post.auto()
  static disableServerSideValidationStrings = withZod({
    disableServerSideValidation: ['body'],
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
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
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });
  @post.auto()
  static skipSchemaEmissionStrings = withZod({
    skipSchemaEmission: ['body'],
    body: z.object({ hello: z.literal('world') }),
    query: z.object({ search: z.literal('value') }),
    handle: async (req) => {
      const body = await req.json();
      const search = req.nextUrl.searchParams.get('search');
      return { body, search };
    },
  });

  @post.auto()
  static validateEveryIteration = withZod({
    validateEveryIteration: true,
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.union([z.literal('a'), z.literal('b'), z.literal('c'), z.literal('d')]) }),
    async *handle(req) {
      for (const value of req.vovk.query().values) {
        yield { value };
      }
    },
  });
}
