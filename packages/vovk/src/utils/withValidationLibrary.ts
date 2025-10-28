import { HttpException } from '../HttpException';
import {
  HttpStatus,
  VovkHandlerSchema,
  VovkTypedMethod,
  VovkValidationType,
  type KnownAny,
  type VovkRequest,
  type VovkOperationObject,
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
  TBodyModel,
  TQueryModel,
  TParamsModel,
  TOutputModel,
  TIterationModel,
  TIsForm extends boolean = false,
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
  preferTransformed,
  operationObject,
}: {
  isForm: TIsForm | undefined;
  disableServerSideValidation: boolean | VovkValidationType[] | undefined;
  skipSchemaEmission: boolean | VovkValidationType[] | undefined;
  validateEachIteration: boolean | undefined;
  body: TBodyModel | undefined;
  query: TQueryModel | undefined;
  params: TParamsModel | undefined;
  output: TOutputModel | undefined;
  iteration: TIterationModel | undefined;
  handle: T;
  toJSONSchema:
    | ((
        model: KnownAny, // performance concern
        meta: { type: VovkValidationType }
      ) => KnownAny)
    | undefined;
  validate: (
    data: KnownAny,
    model: NonNullable<TBodyModel | TQueryModel | TParamsModel | TOutputModel | TIterationModel>,
    meta: {
      type: VovkValidationType | 'form';
      req: VovkRequestAny;
      status?: number;
      i?: number;
    }
  ) => KnownAny;
  preferTransformed: boolean | undefined;
  operationObject: VovkOperationObject | undefined;
}) {
  preferTransformed = preferTransformed ?? true;
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
    const data = await handle(req, handlerParams);
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

      const parsed = (await validate(data, output, { type: 'output', req })) ?? data;
      return preferTransformed ? parsed : data;
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
          let parsed;
          if (validateEachIteration || i === 0) {
            parsed = (await validate(item, iteration, { type: 'iteration', req, status: 200, i })) ?? item;
          } else {
            parsed = item;
          }
          i++;
          yield preferTransformed ? parsed : item;
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
        const parsed = (await validate(data, body, { type: isForm ? 'form' : 'body', req })) ?? data;
        const instance = preferTransformed ? parsed : data;

        // redeclare to add ability to call req.json() and req.vovk.body() again
        req.json = () => Promise.resolve(data);
        req.vovk[isForm ? 'form' : 'body'] = () => Promise.resolve(instance);
      }

      if (query && !disableServerSideValidationKeys.includes('query')) {
        const data = req.vovk.query();
        const parsed = (await validate(data, query, { type: 'query', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.query = () => instance;
      }

      if (params && !disableServerSideValidationKeys.includes('params')) {
        const data = req.vovk.params();
        const parsed = (await validate(data, params, { type: 'params', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.params = () => instance;
      }
    }

    return outputHandler(req, handlerParams);
  }) as T & {
    schema: Omit<VovkHandlerSchema, 'httpMethod' | 'path'> & Partial<VovkHandlerSchema>;
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

  function fn<TReturnType = ReturnType<T>>(
    input?: IsInputOptional extends true ? FnInput : never
  ): IsInputOptional extends true ? TReturnType : never;
  function fn<TReturnType = ReturnType<T>>(input: FnInput): TReturnType;
  function fn<TReturnType = ReturnType<T>>(input?: FnInput): TReturnType {
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
    ) as TReturnType;
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
    const getJSONSchema = (model: KnownAny, type: VovkValidationType) =>
      Object.assign(toJSONSchema(model, { type }), type === 'body' && isForm ? { 'x-isForm': isForm } : {});

    const validation: VovkHandlerSchema['validation'] = {};
    if (body && !skipSchemaEmissionKeys.includes('body')) {
      validation.body = getJSONSchema(body, 'body');
    }
    if (query && !skipSchemaEmissionKeys.includes('query')) {
      validation.query = getJSONSchema(query, 'query');
    }
    if (params && !skipSchemaEmissionKeys.includes('params')) {
      validation.params = getJSONSchema(params, 'params');
    }
    if (output && !skipSchemaEmissionKeys.includes('output')) {
      validation.output = getJSONSchema(output, 'output');
    }
    if (iteration && !skipSchemaEmissionKeys.includes('iteration')) {
      validation.iteration = getJSONSchema(iteration, 'iteration');
    }
    resultHandlerEnhanced.schema = { validation, operationObject };
    setHandlerSchema(resultHandlerEnhanced, { validation, operationObject });
  }

  return resultHandlerEnhanced;
}
