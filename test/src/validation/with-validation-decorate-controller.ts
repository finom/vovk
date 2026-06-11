import {
  post,
  put,
  get,
  operation,
  HttpStatus,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkOutput,
  procedure,
  decorate,
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

// check if the "circular" types don't error
class WithValidationDecorateService {
  static handleAll({
    body,
    query,
    params,
    vovkParams,
  }: {
    body: VovkBody<typeof WithValidationDecorateController.handleAll>;
    query: VovkQuery<typeof WithValidationDecorateController.handleAll>;
    params: VovkParams<typeof WithValidationDecorateController.handleAll>;
    vovkParams: VovkParams<typeof WithValidationDecorateController.handleAll>;
  }) {
    return { body, query, params, vovkParams } satisfies VovkOutput<typeof WithValidationDecorateController.handleAll>;
  }
}

class WithValidationDecorateController {
  static prefix = 'with-validation-decorate';

  static handleAll = decorate(
    post('all/{foo}/{bar}'),
    operation({
      summary: 'Decorate version of handleAll',
      description: 'This is a decorate description',
    }),
    operation.error(HttpStatus.BAD_REQUEST, 'This is a bad request'),
    procedure({
      ...HandleAllInput,
    })
  ).handle(async ({ vovk }, params) => {
    const body = await vovk.body();
    const { search } = vovk.query();
    const vovkParams = vovk.params();
    return WithValidationDecorateService.handleAll({
      body,
      query: { search },
      params,
      vovkParams,
    });
  });

  static handleBody = decorate(
    post.auto(),
    procedure({
      body: z.object({ hello: z.string().max(5) }),
    })
  ).handle(async (req) => {
    return req.vovk.body();
  });

  static handleQuery = decorate(
    get.auto(),
    procedure({
      query: z.object({ search: z.string().max(5) }),
    })
  ).handle((req) => {
    return req.vovk.query();
  });

  static handleParams = decorate(
    put('x/{foo}/{bar}/y'),
    procedure({
      params: z.object({ foo: z.string().max(5), bar: z.string().max(5) }),
    })
  ).handle(async (req) => {
    return req.vovk.params();
  });

  static handleOutput = decorate(
    get.auto(),
    procedure({
      query: z.object({ helloOutput: z.string() }),
      output: z.object({ hello: z.string().max(5) }),
    })
  ).handle(async (req) => {
    return { hello: req.vovk.query().helloOutput };
  });

  static handleStream = decorate(
    get.auto(),
    procedure({
      query: z.object({ values: z.string().array() }),
      iteration: z.object({ value: z.string().max(5) }),
    })
  ).handle(async function* (req) {
    for (const value of req.vovk.query().values) {
      yield { value };
    }
  });
}

export default WithValidationDecorateController;
