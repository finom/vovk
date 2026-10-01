import { HttpException } from '../core/http-exception.js';
import { JSONLinesResponder } from '../core/json-lines-responder.js';
import { setHandlerSchema } from '../core/set-handler-schema.js';
import { bufferBody } from '../req/buffer-body.js';
import { parseForm } from '../req/parse-form.js';
import { reqMeta } from '../req/req-meta.js';
import { validateContentType } from '../req/validate-content-type.js';
import type { VovkHandlerSchema, VovkValidationType } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import type { BodyTypeFromContentType, ContentType, VovkTypedProcedure } from '../types/validation.js';

const validationTypes: VovkValidationType[] = ['body', 'query', 'params', 'output', 'iteration'] as const;

type VovkRequestAny = VovkRequest<KnownAny, KnownAny, KnownAny>;

type Meta = { __disableClientValidation?: boolean; [key: string]: KnownAny };

// fetch() without a body sends no Content-Type, and no length or a length of 0; a chunked body has no length
const hasBody = (req: VovkRequestAny) => {
  if (req.body === null) return false;
  const contentLength = req.headers?.get('content-length');
  return (
    !!req.headers?.get('content-type') ||
    !!req.headers?.get('transfer-encoding') ||
    (!!contentLength && contentLength !== '0')
  );
};

// fn() calls made without a body, the local counterpart of a request without one
const callsWithoutBody = new WeakSet<object>();

export function withValidationLibrary<
  THandle extends VovkTypedProcedure<
    (req: KnownAny, params: KnownAny) => KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    KnownAny,
    ContentType[]
  >,
  TBodyModel,
  TQueryModel,
  TParamsModel,
  TOutputModel,
  TIterationModel,
  TContentType extends ContentType[] = ['application/json'],
>({
  contentType,
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
  contentType: TContentType | undefined;
  disableServerSideValidation: boolean | VovkValidationType[] | undefined;
  skipSchemaEmission: boolean | VovkValidationType[] | undefined;
  validateEachIteration: boolean | undefined;
  body: TBodyModel | undefined;
  query: TQueryModel | undefined;
  params: TParamsModel | undefined;
  output: TOutputModel | undefined;
  iteration: TIterationModel | undefined;
  handle: THandle;
  toJSONSchema: ((model: KnownAny, meta: { validationType: VovkValidationType }) => KnownAny) | undefined;
  validate: (
    data: unknown,
    model: NonNullable<TBodyModel | TQueryModel | TParamsModel | TOutputModel | TIterationModel>,
    meta: {
      validationType: VovkValidationType;
      req: VovkRequestAny;
      status?: number;
      i?: number;
    }
  ) => unknown;
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
  const outputHandler = async (req: VovkRequestAny, handlerParams: Parameters<THandle>[1]) => {
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
      // only undefined means a missing return, falsy values like false or 0 are valid outputs
      if (data === undefined) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }

      const parsed = (await validate(data, output, { validationType: 'output', req })) ?? data;
      return preferTransformed ? parsed : data;
    }

    if (iteration && !disableServerSideValidationKeys.includes('iteration')) {
      // a sync or an async iterable streams, as it does without an iteration schema; an array is sent as JSON
      const isIterable =
        typeof data === 'object' &&
        data !== null &&
        !Array.isArray(data) &&
        (typeof data[Symbol.asyncIterator] === 'function' || typeof data[Symbol.iterator] === 'function');
      if (!isIterable && !(data instanceof JSONLinesResponder)) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Data is neither an iterable nor a JSONLinesResponder, but iteration validation is defined.'
        );
      }

      if (data instanceof JSONLinesResponder) {
        data.onBeforeSend = async (item, i) => {
          let parsed: unknown;
          if (validateEachIteration || i === 0) {
            parsed = (await validate(item, iteration, { validationType: 'iteration', req, status: 200, i })) ?? item;
          } else {
            parsed = item;
          }
          return preferTransformed ? parsed : item;
        };

        return data;
      }

      // Return a brand-new async generator that yields validated items
      return (async function* () {
        let i = 0;
        for await (const item of data) {
          let parsed: unknown;
          if (validateEachIteration || i === 0) {
            parsed = (await validate(item, iteration, { validationType: 'iteration', req, status: 200, i })) ?? item;
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

  const resultHandler = (async (req: VovkRequestAny, handlerParams: Parameters<THandle>[1]) => {
    const { __disableClientValidation } = req.vovk.meta<Meta>();
    // the handler gets the validated params as its second argument, the same value req.vovk.params() returns
    let validatedParams = handlerParams;
    if (!__disableClientValidation) {
      // a declared contentType is enforced even with no body schema to validate against, unless there is no body;
      // disabling body validation still opts out of it, same as in the body branch below
      if (contentType && !body && !disableServerSideValidationKeys.includes('body') && hasBody(req)) {
        validateContentType(req, contentType);
      }

      if (body && !disableServerSideValidationKeys.includes('body')) {
        const isRequest = typeof req.url === 'string';
        // a missing body has no content type to check and is validated as undefined, which an optional schema accepts
        const hasNoBody = isRequest ? !hasBody(req) : callsWithoutBody.has(req);
        let data: unknown;
        if (!hasNoBody) {
          // a wrong content type gets its 415 before the body is read
          validateContentType(req, contentType ?? ['application/json']);
          if (isRequest) await bufferBody(req); // buffer the body to make it replayable for validation and actual parsing
          data = await req.vovk.body();
        }
        const parsed = (await validate(data, body, { validationType: 'body', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.body = () => Promise.resolve(instance);
      }

      if (query && !disableServerSideValidationKeys.includes('query')) {
        const data = req.vovk.query();
        const parsed = (await validate(data, query, { validationType: 'query', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.query = () => instance;
      }

      if (params && !disableServerSideValidationKeys.includes('params')) {
        const data = req.vovk.params();
        const parsed = (await validate(data, params, { validationType: 'params', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.params = () => instance;
        validatedParams = instance as Parameters<THandle>[1];
      }
    }

    return outputHandler(req, validatedParams);
  }) as THandle & {
    schema: Omit<VovkHandlerSchema, 'httpMethod' | 'path'> & Partial<VovkHandlerSchema>;
    wrapper?: (req: VovkRequestAny, params: Parameters<THandle>[1]) => ReturnType<THandle>;
  };

  type FnBody = BodyTypeFromContentType<TContentType, THandle['__types']['body']>;

  type FnInput = {
    disableClientValidation?: boolean;
    transform?: undefined;
  } & (undefined extends typeof body ? { body?: FnBody } : { body: FnBody }) &
    (undefined extends typeof query
      ? { query?: THandle['__types']['query'] }
      : { query: THandle['__types']['query'] }) &
    (undefined extends typeof params
      ? { params?: THandle['__types']['params'] }
      : { params: THandle['__types']['params'] }) & {
      meta?: Meta;
    };

  type FnInputWithTransform<TTransformed> = Omit<FnInput, 'transform'> & {
    transform: (result: Awaited<ReturnType<THandle>>, fakeReq: Pick<VovkRequestAny, 'vovk'>) => TTransformed;
  };

  type IsInputOptional = undefined extends typeof body
    ? undefined extends typeof query
      ? undefined extends typeof params
        ? true
        : false
      : false
    : false;

  function fn<TTransformed>(input: FnInputWithTransform<TTransformed>): Promise<TTransformed>;
  function fn<TReturnType = ReturnType<THandle>>(input?: FnInput): TReturnType;
  function fn<TReturnType = ReturnType<THandle>>(
    input?: IsInputOptional extends true ? FnInput : never
  ): IsInputOptional extends true ? TReturnType : never;
  function fn<TReturnType = ReturnType<THandle>, TTransformed = never>(
    input?: FnInput | FnInputWithTransform<TTransformed>
  ): TReturnType | Promise<TTransformed> {
    let bodyCache: unknown;

    const fakeReq: Pick<
      VovkRequest<THandle['__types']['body'], THandle['__types']['query'], THandle['__types']['params']>,
      'vovk'
    > = {
      vovk: {
        body: () => {
          if (input && input.body instanceof FormData) {
            bodyCache ??= parseForm(input.body);
          } else {
            bodyCache = input?.body;
          }

          return Promise.resolve(bodyCache ?? null);
        },
        query: () => input?.query ?? {},
        params: () => input?.params ?? {},
        meta: <T = KnownAny>(meta?: T | null) => reqMeta<T>(fakeReq, meta),
      },
    };

    fakeReq.vovk.meta<Meta>({ __disableClientValidation: input?.disableClientValidation, ...input?.meta });
    if (input?.body === undefined) callsWithoutBody.add(fakeReq);

    const result = (resultHandler.wrapper ?? resultHandler)(
      fakeReq as VovkRequestAny,
      (input?.params ?? {}) as Parameters<THandle>[1]
    );

    if (input && 'transform' in input && typeof input.transform === 'function') {
      return Promise.resolve(result).then((resolvedResult) =>
        input.transform(resolvedResult, fakeReq)
      ) as Promise<TTransformed>;
    }

    return result as TReturnType;
  }

  const definition = {
    contentType,
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
  };

  const resultHandlerEnhanced = Object.assign(resultHandler, { fn, definition });
  const validation: VovkHandlerSchema['validation'] = {};

  if (toJSONSchema) {
    const getJSONSchema = (model: KnownAny, validationType: VovkValidationType) =>
      Object.assign(
        toJSONSchema(model, { validationType }),
        validationType === 'body' ? { 'x-contentType': contentType } : {}
      );

    if (body && !skipSchemaEmissionKeys.includes('body')) {
      let bodyJSONSchema: unknown;
      Object.defineProperty(validation, 'body', {
        enumerable: true,
        get: () => (bodyJSONSchema ??= getJSONSchema(body, 'body')),
      });
    }
    if (query && !skipSchemaEmissionKeys.includes('query')) {
      let queryJSONSchema: unknown;
      Object.defineProperty(validation, 'query', {
        enumerable: true,
        get: () => (queryJSONSchema ??= getJSONSchema(query, 'query')),
      });
    }
    if (params && !skipSchemaEmissionKeys.includes('params')) {
      let paramsJSONSchema: unknown;
      Object.defineProperty(validation, 'params', {
        enumerable: true,
        get: () => (paramsJSONSchema ??= getJSONSchema(params, 'params')),
      });
    }
    if (output && !skipSchemaEmissionKeys.includes('output')) {
      let outputJSONSchema: unknown;
      Object.defineProperty(validation, 'output', {
        enumerable: true,
        get: () => (outputJSONSchema ??= getJSONSchema(output, 'output')),
      });
    }
    if (iteration && !skipSchemaEmissionKeys.includes('iteration')) {
      let iterationJSONSchema: unknown;
      Object.defineProperty(validation, 'iteration', {
        enumerable: true,
        get: () => (iterationJSONSchema ??= getJSONSchema(iteration, 'iteration')),
      });
    }
  }

  resultHandlerEnhanced.schema = { validation, operationObject };
  setHandlerSchema(resultHandlerEnhanced, { validation, operationObject });

  return resultHandlerEnhanced;
}
