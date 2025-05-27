import { HttpException } from '../HttpException.js';
import { HttpStatus, VovkHandlerSchema, VovkValidationType, type KnownAny, type VovkRequest } from '../types.js';
import reqMeta from './reqMeta.js';
import { setHandlerSchema } from './setHandlerSchema.js';

const validationTypes: VovkValidationType[] = ['body', 'query', 'params', 'output', 'iteration'] as const;

type VovkRequestAny = VovkRequest<KnownAny, KnownAny, KnownAny>;

type Meta = { __disableValidation?: boolean };

export function withValidation<
  T extends ((req: KnownAny, params: KnownAny) => KnownAny) & {
    __types: {
      body: KnownAny;
      query: KnownAny;
      params: KnownAny;
      output: KnownAny;
      iteration: KnownAny;
    };
  },
  BODY_MODEL,
  QUERY_MODEL,
  PARAMS_MODEL,
  OUTPUT_MODEL,
  ITERATION_MODEL,
>({
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
  body,
  query,
  params,
  output,
  iteration,
  handle,
  getJSONSchemaFromModel,
  validate,
}: {
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  body?: BODY_MODEL;
  query?: QUERY_MODEL;
  params?: PARAMS_MODEL;
  output?: OUTPUT_MODEL;
  iteration?: ITERATION_MODEL;
  handle: T;
  getJSONSchemaFromModel?: (
    model: NonNullable<BODY_MODEL | QUERY_MODEL | PARAMS_MODEL | OUTPUT_MODEL | ITERATION_MODEL>,
    meta: { type: VovkValidationType }
  ) => KnownAny;
  validate: (
    data: KnownAny,
    model: NonNullable<BODY_MODEL | QUERY_MODEL | PARAMS_MODEL | OUTPUT_MODEL | ITERATION_MODEL>,
    meta: {
      type: VovkValidationType;
      req: VovkRequestAny;
      status?: number;
      i?: number;
    }
  ) => KnownAny;
}) {
  const disableServerSideValidationKeys =
    disableServerSideValidation === false
      ? []
      : disableServerSideValidation === true
        ? validationTypes
        : (disableServerSideValidation ?? []);
  const skipSchemaEmissionKeys =
    skipSchemaEmission === false ? [] : skipSchemaEmission === true ? validationTypes : (skipSchemaEmission ?? []);
  const outputHandler = async (req: VovkRequestAny, handlerParams: Parameters<T>[1]) => {
    const { __disableValidation } = req.vovk.meta<Meta>();
    const data = await handle(req, handlerParams);
    if (__disableValidation) {
      return data;
    }
    if (output && iteration) {
      throw new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Output and iteration are mutually exclusive. You can't use them together."
      );
    }

    if (output && !disableServerSideValidationKeys.includes('output')) {
      if (!data) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      await validate(data, output, { type: 'output', req });
    }

    if (iteration && !disableServerSideValidationKeys.includes('iteration')) {
      // We assume `data` is an async iterable here; you might want to check that:
      if (!data || typeof data[Symbol.asyncIterator] !== 'function') {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Data is not an async iterable but iteration validation is defined.'
        );
      }

      // Return a brand-new async generator that yields validated items
      return (async function* () {
        let i = 0;
        for await (const item of data) {
          if (validateEachIteration || i === 0) {
            await validate(item, iteration, { type: 'iteration', req, status: 200, i });
          }
          i++;
          yield item;
        }
      })();
    } else if (validateEachIteration) {
      throw new HttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'validateEachIteration is set but iteration is not defined.'
      );
    }

    return data;
  };

  const resultHandler = (async (req: VovkRequestAny, handlerParams: Parameters<T>[1]) => {
    const { __disableValidation } = req.vovk.meta<Meta>();
    if (!__disableValidation) {
      if (body && !disableServerSideValidationKeys.includes('body')) {
        const data = await req.vovk.body();
        const instance = (await validate(data, body, { type: 'body', req })) ?? data;

        // redeclare to add ability to call req.json() again
        req.json = () => Promise.resolve(data);
        req.vovk.body = () => Promise.resolve(instance);
      }

      if (query && !disableServerSideValidationKeys.includes('query')) {
        const data = req.vovk.query();
        const instance = (await validate(data, query, { type: 'query', req })) ?? data;
        req.vovk.query = () => instance;
      }

      if (params && !disableServerSideValidationKeys.includes('params')) {
        const data = req.vovk.params();
        const instance = (await validate(data, params, { type: 'params', req })) ?? data;
        req.vovk.params = () => instance;
      }
    }

    return outputHandler(req, handlerParams);
  }) as T & {
    schema: VovkHandlerSchema;
  };

  function func(input: {
    body?: T['__types']['body'];
    query?: T['__types']['query'];
    params?: T['__types']['params'];
    disableValidation?: boolean;
  }) {
    const fakeReq: Pick<VovkRequest<typeof body, typeof query, typeof params>, 'vovk'> = {
      vovk: {
        body: () => Promise.resolve(input.body as T['__types']['body']),
        query: () => input.query as T['__types']['query'],
        params: () => input.params as T['__types']['params'],
        meta: <T = KnownAny>(meta?: T | null) => reqMeta<T>(fakeReq as VovkRequestAny, meta),
        form: () => {
          throw new Error('Form data is not supported in this context.');
        },
      },
    };

    fakeReq.vovk.meta<Meta>({ __disableValidation: input.disableValidation });

    return resultHandler(fakeReq, input.params ?? {});
  }

  const models = {
    body,
    query,
    params,
    output,
    iteration,
  };

  const resultHandlerEnhanced = Object.assign(resultHandler, { func, models });

  if (getJSONSchemaFromModel) {
    const validation: VovkHandlerSchema['validation'] = {};
    if (body && !skipSchemaEmissionKeys.includes('body')) {
      validation.body = getJSONSchemaFromModel(body, { type: 'body' });
    }
    if (query && !skipSchemaEmissionKeys.includes('query')) {
      validation.query = getJSONSchemaFromModel(query, { type: 'query' });
    }
    if (params && !skipSchemaEmissionKeys.includes('params')) {
      validation.params = getJSONSchemaFromModel(params, { type: 'params' });
    }
    if (output && !skipSchemaEmissionKeys.includes('output')) {
      validation.output = getJSONSchemaFromModel(output, { type: 'output' });
    }
    if (iteration && !skipSchemaEmissionKeys.includes('iteration')) {
      validation.iteration = getJSONSchemaFromModel(iteration, { type: 'iteration' });
    }
    setHandlerSchema(resultHandlerEnhanced, { validation });
  }

  return resultHandlerEnhanced;
}
