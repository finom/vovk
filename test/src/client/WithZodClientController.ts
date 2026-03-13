import {
  post,
  put,
  get,
  prefix,
  operation,
  HttpStatus,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkOutput,
  procedure,
  JSONLinesResponder,
} from 'vovk';
import { z } from 'zod';

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
  @operation({
    summary: 'This is a summary',
    description: 'This is a description',
  })
  @operation.error(HttpStatus.BAD_REQUEST, 'This is a bad request')
  @post('all/{foo}/{bar}')
  static handleAll = procedure({
    ...HandleAllInput,
  }).handle(async ({ vovk }, params) => {
    const body = await vovk.body();
    const { search } = vovk.query();
    const vovkParams = vovk.params();
    return WithZodClientService.handleAll({
      body,
      query: { search },
      params,
      vovkParams,
    });
  });

  @get.auto()
  static handleQuery = procedure({
    query: z.object({ search: z.string().max(5) }),
  }).handle((req) => {
    return req.vovk.query();
  });

  @post.auto()
  static handleBody = procedure({
    body: z.object({ hello: z.string().max(5) }),
  }).handle(async (req) => {
    return req.vovk.body();
  });

  @put('x/{foo}/{bar}/y')
  static handleParams = procedure({
    params: z.object({ foo: z.string().max(5), bar: z.string().max(5) }),
  }).handle(async (req) => {
    return req.vovk.params();
  });

  @get.auto()
  static handleNestedQuery = procedure({
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
  }).handle((req) => {
    return req.vovk.query();
  });

  @get.auto()
  static handleOutput = procedure({
    query: z.object({ helloOutput: z.string() }),
    output: z.object({ hello: z.string().max(5) }),
  }).handle(async (req) => {
    return { hello: req.vovk.query().helloOutput };
  });

  @get.auto()
  static handleStream = procedure({
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
  }).handle(async function* (req) {
    for (const value of req.vovk.query().values) {
      yield { value };
    }
  });

  @get.auto()
  static handleStreamNoIterationValidation = procedure({
    query: z.object({ values: z.string().array() }),
  }).handle(async function* (req) {
    for (const value of req.vovk.query().values) {
      yield { value };
    }
  });

  @get.auto()
  static handleResponderStream = procedure({
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<{ value: string }>(req);

    void (async () => {
      for (const value of req.vovk.query().values) {
        await responder.send({ value });
      }
      responder.close();
    })();

    return responder;
  });

  @post.auto()
  static handleSchemaConstraints = procedure({
    body: ConstrainingModel,
  }).handle(async (req) => {
    return req.json();
  });

  @post.auto()
  static handleNothitng = procedure().handle(async () => {
    return { nothing: 'here' } as const;
  });

  @post.auto()
  static handleMultipartDataOnly = procedure({
    contentType: ['multipart/form-data'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    output: z.strictObject({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const { hello } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });

  @post.auto()
  static handleMultipartAndJsonData = procedure({
    contentType: ['multipart/form-data', 'application/json'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const { hello } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });

  @post.auto()
  static handleMultipartDataWithFile = procedure({
    contentType: ['multipart/form-data'],
    body: z.object({ hello: z.string().max(5), file: z.file() }),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), file: z.string(), search: z.string() }),
  }).handle(async (req) => {
    const { hello, file } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, file: await file.text(), search };
  });

  @post.auto()
  static handleMultipartDataWithMultipleFiles = procedure({
    contentType: ['multipart/form-data'],
    body: z.object({ hello: z.string().max(5), files: z.array(z.file()) }),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), files: z.array(z.string()), search: z.string() }),
  }).handle(async (req) => {
    const { hello, files } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, files: await Promise.all(files.map((file) => file.text())), search };
  });

  @post.auto()
  static handleUrlEncodedData = procedure({
    contentType: ['application/x-www-form-urlencoded'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const { hello } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });

  @post.auto()
  static handleTextPlainData = procedure({
    contentType: ['text/plain'],
    body: z.string().max(5),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const hello = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });

  @post.auto()
  static handleOctetStreamData = procedure({
    contentType: ['image/png'],
    body: z.file(),
    output: z.object({ fileName: z.string() }),
  }).handle(async (req) => {
    const file = await req.vovk.body();
    return { fileName: file.name };
  });

  @post.auto()
  static handleOctetStreamOrJsonData = procedure({
    contentType: ['image/png', 'application/json'],
    body: z.union([z.file(), z.object({ hello: z.string().max(5) })]),
    output: z.object({ type: z.string(), hello: z.string().max(5) }),
  }).handle(async (req) => {
    const fileOrJson = await req.vovk.body();
    return fileOrJson instanceof File
      ? { type: fileOrJson.type, hello: 'none' }
      : { hello: fileOrJson.hello, type: 'none' };
  });

  @post.auto()
  static disableServerSideValidationBool = procedure({
    disableServerSideValidation: true,
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
  }).handle(async (req) => {
    const body = await req.json();
    const search = req.nextUrl.searchParams.get('search');
    return { body, search };
  });

  @post.auto()
  static disableServerSideValidationStrings = procedure({
    disableServerSideValidation: ['body'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string().max(5) }),
  }).handle(async (req) => {
    const body = await req.json();
    const search = req.nextUrl.searchParams.get('search');
    return { body, search };
  });

  // skipSchemaEmission
  @post.auto()
  static skipSchemaEmissionBool = procedure({
    skipSchemaEmission: true,
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
  }).handle(async (req) => {
    const body = await req.json();
    const search = req.nextUrl.searchParams.get('search');
    return { body, search };
  });
  @post.auto()
  static skipSchemaEmissionStrings = procedure({
    skipSchemaEmission: ['body'],
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
  }).handle(async (req) => {
    const body = await req.json();
    const search = req.nextUrl.searchParams.get('search');
    return { body, search };
  });

  // validateEachIteration
  @post.auto()
  static validateEachIteration = procedure({
    validateEachIteration: true,
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
  }).handle(async function* (req) {
    for (const value of req.vovk.query().values) {
      yield { value };
    }
  });

  @post.auto()
  static validateEachResponderIteration = procedure({
    validateEachIteration: true,
    query: z.object({ values: z.string().array() }),
    iteration: z.object({ value: z.string().max(5) }),
  }).handle(async (req) => {
    const responder = new JSONLinesResponder<{ value: string }>(req);

    void (async () => {
      for (const value of req.vovk.query().values) {
        await responder.send({ value });
      }
      responder.close();
    })();

    return responder;
  });

  static handleAllNoHTTP = procedure({
    ...HandleAllInput,
  }).handle(async ({ vovk }, params) => {
    const body = await vovk.body();
    const { search } = vovk.query();
    const vovkParams = vovk.params();
    return WithZodClientService.handleAll({
      body,
      query: { search },
      params,
      vovkParams,
    });
  });

  @post('all-as-func/{foo}/{bar}')
  static handleAllAsFunction = procedure({
    ...HandleAllInput,
    disableServerSideValidation: true,
  }).handle(async (req, params) => {
    const result = await WithZodClientController.handleAll.fn({
      body: await req.vovk.body(),
      query: req.vovk.query(),
      params,
    });

    return result;
  });

  @post('all-no-http-as-func/{foo}/{bar}')
  static handleAllNoHttpAsFunction = procedure({
    ...HandleAllInput,
    disableServerSideValidation: true,
  }).handle(async (req, params) => {
    const result = await WithZodClientController.handleAllNoHTTP.fn({
      body: await req.vovk.body(),
      query: req.vovk.query(),
      params,
    });

    return result;
  });

  @get.auto()
  static handlePagination = procedure({
    query: z.object({
      page: z.string(),
      limit: z.string(),
    }),
    output: z.object({
      items: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      ),
      hasNextPage: z.boolean(),
      nextPage: z.number().optional(),
    }),
  }).handle(async (req) => {
    const query = req.vovk.query();
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;

    // Generate dummy data
    const items = Array.from({ length: limit }, (_, i) => ({
      id: (page - 1) * limit + i + 1,
      name: `Item ${(page - 1) * limit + i + 1}`,
    }));

    // For example purposes, let's say we have 50 items total
    const totalItems = 50;
    const hasNextPage = page * limit < totalItems;

    return {
      items,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : undefined,
    };
  });

  // === Content-type validation: wildcard */* ===
  @post.auto()
  static handleWildcardContentType = procedure({
    contentType: ['*/*'],
    body: z.file(),
    output: z.object({ size: z.number(), type: z.string() }),
  }).handle(async (req) => {
    const file = await req.vovk.body();
    return { size: file.size, type: file.type };
  });

  // === Content-type validation: wildcard */* with JSON body ===
  @post.auto()
  static handleWildcardContentTypeWithJsonBody = procedure({
    contentType: ['*/*'],
    body: z.object({ hello: z.string().max(5) }),
    output: z.object({ hello: z.string() }),
  }).handle(async (req) => {
    const body = await req.vovk.body();
    return { hello: body.hello };
  });

  // === Content-type validation: partial wildcard image/* ===
  @post.auto()
  static handleImageWildcard = procedure({
    contentType: ['image/*'],
    body: z.file(),
    output: z.object({ size: z.number(), type: z.string() }),
  }).handle(async (req) => {
    const file = await req.vovk.body();
    return { size: file.size, type: file.type };
  });

  // === Content-type validation: true application/octet-stream binary ===
  @post.auto()
  static handleBinaryOctetStream = procedure({
    contentType: ['application/octet-stream'],
    body: z.file(),
    output: z.object({ size: z.number(), content: z.string() }),
  }).handle(async (req) => {
    const file = await req.vovk.body();
    return { size: file.size, content: await file.text() };
  });

  // === bufferBody re-readability: JSON body ===
  @post.auto()
  static handleJsonRereadAfterValidation = procedure({
    body: z.object({ hello: z.string().max(5) }),
  }).handle(async (req) => {
    const vovkBody = await req.vovk.body();
    const fromJson = await req.json();
    const fromText = await req.text();
    const arrayBuf = await req.arrayBuffer();
    const blob = await req.blob();
    return {
      vovkBody,
      fromJson,
      fromText,
      arrayBufferByteLength: arrayBuf.byteLength,
      blobSize: blob.size,
    };
  });

  // === bufferBody re-readability: text/plain body ===
  @post.auto()
  static handleTextRereadAfterValidation = procedure({
    contentType: ['text/plain'],
    body: z.string().max(100),
  }).handle(async (req) => {
    const vovkBody = await req.vovk.body();
    const fromText = await req.text();
    const arrayBuf = await req.arrayBuffer();
    return {
      vovkBody,
      fromText,
      arrayBufferByteLength: arrayBuf.byteLength,
    };
  });

  // === bufferBody re-readability: multipart/form-data body ===
  @post.auto()
  static handleFormDataRereadAfterValidation = procedure({
    contentType: ['multipart/form-data'],
    body: z.object({ name: z.string() }),
  }).handle(async (req) => {
    const vovkBody = await req.vovk.body();
    const formData = await req.formData();
    return {
      vovkBody,
      formDataKeys: Array.from(formData.keys()).sort(),
    };
  });

  // === bufferBody re-readability: application/octet-stream binary body ===
  @post.auto()
  static handleBinaryRereadAfterValidation = procedure({
    contentType: ['application/octet-stream'],
    body: z.file(),
  }).handle(async (req) => {
    const file = await req.vovk.body();
    const blob = await req.blob();
    const arrayBuf = await req.arrayBuffer();
    const bytes = await req.bytes();
    return {
      vovkBodyContent: await file.text(),
      blobSize: blob.size,
      arrayBufferByteLength: arrayBuf.byteLength,
      bytesLength: bytes.length,
    };
  });

  // === String contentType (not array) ===
  @post.auto()
  static handleStringContentTypeJson = procedure({
    contentType: 'application/json',
    body: z.object({ hello: z.string().max(5) }),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const { hello } = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });

  @post.auto()
  static handleStringContentTypeTextPlain = procedure({
    contentType: 'text/plain',
    body: z.string().max(5),
    query: z.object({ search: z.string() }),
    output: z.object({ hello: z.string().max(5), search: z.string() }),
  }).handle(async (req) => {
    const hello = await req.vovk.body();
    const search = req.vovk.query().search;
    return { hello, search };
  });
}
