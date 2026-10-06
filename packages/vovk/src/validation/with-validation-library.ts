import { HttpException } from '../core/http-exception.js';
import { JSONLinesResponder, setResponderHooks } from '../core/json-lines-responder.js';
import { setHandlerSchema } from '../core/set-handler-schema.js';
import { bufferBody } from '../req/buffer-body.js';
import { getMediaType } from '../req/get-media-type.js';
import { parseBody } from '../req/parse-body.js';
import { parseForm } from '../req/parse-form.js';
import { reqMeta } from '../req/req-meta.js';
import { validateContentType } from '../req/validate-content-type.js';
import type { VovkHandlerSchema, VovkValidationType } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import type { BodyTypeFromContentType, ContentType, VovkTypedProcedure } from '../types/validation.js';
import { fileNameToDisposition } from '../utils/file-name-to-disposition.js';
import { isJSONObject } from '../utils/map-json-schema-refs.js';
import { getBinaryContentType } from '../utils/media-types.js';

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

// fn() reads a body as the server reads a request that carries it: a form or bytes by the content type the client
// sends them with, any other value as it is
const parseFnBody = async (body: unknown, contentType: string[] | undefined) => {
  if (body instanceof FormData) return parseForm(body);
  const isBytes = body instanceof Blob || body instanceof ArrayBuffer || ArrayBuffer.isView(body);
  if (!isBytes && !(body instanceof URLSearchParams)) return body ?? null;
  const declared = (contentType ?? ['application/json']).map((type) => type.toLowerCase());
  const type =
    body instanceof URLSearchParams
      ? 'application/x-www-form-urlencoded'
      : getBinaryContentType(body instanceof Blob ? body.type : '', declared);
  const headers = {
    'content-type': type,
    ...(body instanceof File ? { 'content-disposition': fileNameToDisposition(body.name) } : {}),
  };
  return parseBody(new Request('http://localhost', { method: 'POST', body: body as BodyInit, headers }));
};

// whether a JSON Schema takes an array, or null, and no single value
const takesArray = (schema: unknown): boolean => {
  if (!isJSONObject(schema)) return false;
  if (schema.type !== undefined) {
    const types = [schema.type].flat();
    return types.includes('array') && types.every((type) => type === 'array' || type === 'null');
  }
  const branches = schema.anyOf ?? schema.oneOf;
  return (
    Array.isArray(branches) &&
    branches.some(takesArray) &&
    branches.every((branch) => takesArray(branch) || (isJSONObject(branch) && branch.type === 'null'))
  );
};

// the query keys whose schema takes an array (nested: null), or holds such keys (nested: their plan)
type ArrayPlan = { key: string; nested: ArrayPlan | null }[];

const toArrayPlan = (schema: unknown): ArrayPlan | null => {
  if (!isJSONObject(schema) || !isJSONObject(schema.properties)) return null;
  const plan: ArrayPlan = [];
  for (const [key, property] of Object.entries(schema.properties)) {
    const isArray = takesArray(property);
    const nested = isArray ? null : toArrayPlan(property);
    if (isArray || nested) plan.push({ key, nested });
  }
  return plan.length ? plan : null;
};

// a key given once is a string, so where the query schema takes an array, as in the OpenAPI form style a client sends
// one item as tags=a, it is read as a one-item array; also in nested objects
const withLoneValuesAsArrays = (query: unknown, plan: ArrayPlan | null): unknown => {
  if (!plan || !isJSONObject(query)) return query;
  let result = query;
  for (const { key, nested } of plan) {
    const value = query[key];
    const next = nested ? withLoneValuesAsArrays(value, nested) : typeof value === 'string' ? [value] : value;
    if (next === value || !Object.hasOwn(query, key)) continue;
    if (result === query) result = { ...query };
    result[key] = next;
  }
  return result;
};

// a buffered body read as JSON that has no bytes, as fetch() sends a JSON content type for a call without a body
const isEmptyJSONBody = async (req: VovkRequestAny) => {
  const contentType = req.headers.get('content-type');
  const mediaType = contentType ? getMediaType(contentType) : null;
  const isJSON = !contentType || mediaType === 'application/json' || !!mediaType?.endsWith('+json');
  return isJSON && (await req.blob()).size === 0;
};

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
  // refused where the procedure is defined, as the handler would run before the call fails
  if (output && iteration) {
    throw new Error("Output and iteration are mutually exclusive. You can't use them together.");
  }
  preferTransformed = preferTransformed ?? true;
  const disableServerSideValidationKeys =
    disableServerSideValidation === false
      ? []
      : disableServerSideValidation === true
        ? validationTypes
        : (disableServerSideValidation ?? []);
  const skipSchemaEmissionKeys =
    skipSchemaEmission === false ? [] : skipSchemaEmission === true ? validationTypes : (skipSchemaEmission ?? []);
  // made on the first request; a schema JSON Schema can't describe leaves the query as it is
  let arrayPlan: ArrayPlan | null | undefined;
  const getArrayPlan = () => {
    if (arrayPlan === undefined) {
      try {
        arrayPlan = toArrayPlan(query && toJSONSchema?.(query, { validationType: 'query' }));
      } catch {
        arrayPlan = null;
      }
    }
    return arrayPlan;
  };
  const outputHandler = async (req: VovkRequestAny, handlerParams: Parameters<THandle>[1]) => {
    const { __disableClientValidation } = req.vovk.meta<Meta>();
    const onBeforeSend =
      iteration && !disableServerSideValidationKeys.includes('iteration') && !__disableClientValidation
        ? async (item: unknown, i: number) => {
            let parsed: unknown;
            if (validateEachIteration || i === 0) {
              parsed = (await validate(item, iteration, { validationType: 'iteration', req, status: 200, i })) ?? item;
            } else {
              parsed = item;
            }
            return preferTransformed ? parsed : item;
          }
        : undefined;
    // a responder made with req checks a line the handler sends before it returns the responder
    if (onBeforeSend) setResponderHooks(req, { onBeforeSend });
    const data = await handle(req, handlerParams);
    if (__disableClientValidation) {
      return data;
    }

    if (output && !disableServerSideValidationKeys.includes('output')) {
      let parsed: unknown;
      try {
        parsed = (await validate(data, output, { validationType: 'output', req })) ?? data;
      } catch (error) {
        // undefined the schema refuses is a missing return; falsy values like false or 0 are outputs
        if (data === undefined) {
          throw new HttpException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Output is required. You probably forgot to return something from your handler.'
          );
        }
        throw error;
      }
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
        // one made without req gets the check here
        if (onBeforeSend) data.onBeforeSend = onBeforeSend;

        return data;
      }

      // the generator below checks the items, so the responder vovk makes for it doesn't check them again
      if (onBeforeSend) setResponderHooks(req, { onBeforeSend: undefined });
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
    } else if (validateEachIteration && !iteration) {
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
          // an empty JSON body is no body, empty text or an empty file is one
          if (!isRequest || !(await isEmptyJSONBody(req))) data = await req.vovk.body();
        }
        const parsed = (await validate(data, body, { validationType: 'body', req })) ?? data;
        const instance = preferTransformed ? parsed : data;
        req.vovk.body = () => Promise.resolve(instance);
      }

      if (query && !disableServerSideValidationKeys.includes('query')) {
        const data = withLoneValuesAsArrays(req.vovk.query(), getArrayPlan());
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
    let parsedBody: Promise<unknown> | undefined;

    const fakeReq: Pick<
      VovkRequest<THandle['__types']['body'], THandle['__types']['query'], THandle['__types']['params']>,
      'vovk'
    > = {
      vovk: {
        body: () => (parsedBody ??= parseFnBody(input?.body, contentType)),
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
    } else if (contentType) {
      // the declared types alone, also when the body schema is skipped, so every client sends a body the server accepts
      validation.body = { 'x-contentType': contentType };
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
