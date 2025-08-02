import { HttpException } from '../HttpException';
import {
  HttpStatus,
  VovkHandlerSchema,
  VovkTypedMethod,
  VovkValidationType,
  type KnownAny,
  type VovkRequest,
} from '../types';
import reqMeta from './reqMeta';
import { setHandlerSchema } from './setHandlerSchema';

const validationTypes: VovkValidationType[] = ['body', 'query', 'params', 'output', 'iteration'] as const;

type VovkRequestAny = VovkRequest<KnownAny, KnownAny, KnownAny>;

type Meta = { __disableClientValidation?: boolean; [key: string]: KnownAny };

export function withValidationLibrary<
  T extends VovkTypedMethod<
    (req: KnownAny, params: KnownAny) => KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    boolean
  >,
  BODY_MODEL,
  QUERY_MODEL,
  PARAMS_MODEL,
  OUTPUT_MODEL,
  ITERATION_MODEL,
  IS_FORM extends boolean = false,
>({
  isForm,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
  body,
  query,
  params,
  output,
  iteration,
  handle,
  toJSONSchema,
  validate,
}: {
  isForm?: IS_FORM;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  body?: BODY_MODEL;
  query?: QUERY_MODEL;
  params?: PARAMS_MODEL;
  output?: OUTPUT_MODEL;
  iteration?: ITERATION_MODEL;
  handle: T;
  toJSONSchema?: (
    model: KnownAny, // performance concern
    meta: { type: VovkValidationType }
  ) => KnownAny;
  validate: (
    data: KnownAny,
    model: NonNullable<BODY_MODEL | QUERY_MODEL | PARAMS_MODEL | OUTPUT_MODEL | ITERATION_MODEL>,
    meta: {
      type: VovkValidationType | 'form';
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
    const { __disableClientValidation } = req.vovk.meta<Meta>();
    let data = await handle(req, handlerParams);
    if (__disableClientValidation) {
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
      data = (await validate(data, output, { type: 'output', req })) ?? data;
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
        for await (let item of data) {
          if (validateEachIteration || i === 0) {
            item = (await validate(item, iteration, { type: 'iteration', req, status: 200, i })) ?? item;
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
    const { __disableClientValidation } = req.vovk.meta<Meta>();
    if (!__disableClientValidation) {
      if (body && !disableServerSideValidationKeys.includes('body')) {
        const data = await req.vovk[isForm ? 'form' : 'body']();
        const instance = (await validate(data, body, { type: isForm ? 'form' : 'body', req })) ?? data;

        // redeclare to add ability to call req.json() and req.vovk.body() again
        req.json = () => Promise.resolve(data);
        req.vovk[isForm ? 'form' : 'body'] = () => Promise.resolve(instance);
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
    wrapper?: (req: VovkRequestAny, params: Parameters<T>[1]) => ReturnType<T>;
  };

  type FnInput = {
    disableClientValidation?: boolean;
  } & (undefined extends typeof body ? { body?: T['__types']['body'] } : { body: T['__types']['body'] }) &
    (undefined extends typeof query ? { query?: T['__types']['query'] } : { query: T['__types']['query'] }) &
    (undefined extends typeof params ? { params?: T['__types']['params'] } : { params: T['__types']['params'] }) & {
      meta?: Meta;
    };

  type IsInputOptional = undefined extends typeof body
    ? undefined extends typeof query
      ? undefined extends typeof params
        ? true
        : false
      : false
    : false;

  function fn<RETURN_TYPE = ReturnType<T>>(
    input?: IsInputOptional extends true ? FnInput : never
  ): IsInputOptional extends true ? RETURN_TYPE : never;
  function fn<RETURN_TYPE = ReturnType<T>>(input: FnInput): RETURN_TYPE;
  function fn<RETURN_TYPE = ReturnType<T>>(input?: FnInput): RETURN_TYPE {
    const fakeReq: Pick<VovkRequest<T['__types']['body'], T['__types']['query'], T['__types']['params']>, 'vovk'> = {
      vovk: {
        body: () => Promise.resolve((input?.body ?? {}) as T['__types']['body']),
        query: () => (input?.query ?? {}) as T['__types']['query'],
        params: () => (input?.params ?? {}) as T['__types']['params'],
        meta: <T = KnownAny>(meta?: T | null) => reqMeta<T>(fakeReq as VovkRequestAny, meta),
        form: () => {
          throw new Error('Form data is not supported in this context.');
        },
      },
    };

    fakeReq.vovk.meta<Meta>({ __disableClientValidation: input?.disableClientValidation, ...input?.meta });

    return (resultHandler.wrapper ?? resultHandler)(
      fakeReq as VovkRequestAny,
      (input?.params ?? {}) as Parameters<T>[1]
    ) as RETURN_TYPE;
  }

  const models = {
    ...(body !== undefined ? { body } : {}),
    ...(query !== undefined ? { query } : {}),
    ...(params !== undefined ? { params } : {}),
    ...(output !== undefined ? { output } : {}),
    ...(iteration !== undefined ? { iteration } : {}),
  };

  const resultHandlerEnhanced = Object.assign(resultHandler, { fn, models });

  if (toJSONSchema) {
    const getJsonSchema = (model: KnownAny, type: VovkValidationType) =>
      Object.assign(toJSONSchema(model, { type }), type === 'body' && isForm ? { 'x-formData': isForm } : {});

    const validation: VovkHandlerSchema['validation'] = {};
    if (body && !skipSchemaEmissionKeys.includes('body')) {
      validation.body = getJsonSchema(body, 'body');
    }
    if (query && !skipSchemaEmissionKeys.includes('query')) {
      validation.query = getJsonSchema(query, 'query');
    }
    if (params && !skipSchemaEmissionKeys.includes('params')) {
      validation.params = getJsonSchema(params, 'params');
    }
    if (output && !skipSchemaEmissionKeys.includes('output')) {
      validation.output = getJsonSchema(output, 'output');
    }
    if (iteration && !skipSchemaEmissionKeys.includes('iteration')) {
      validation.iteration = getJsonSchema(iteration, 'iteration');
    }
    setHandlerSchema(resultHandlerEnhanced, { validation });
  }

  return resultHandlerEnhanced;
}
