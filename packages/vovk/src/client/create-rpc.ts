import { HttpException } from '../core/http-exception.js';
import type { VovkHandlerSchema } from '../internal.js';
import type { ClientMethod, VovkFetcher, VovkFetcherOptions, VovkRPCModule } from '../types/client.js';
import type { ControllerStaticMethod, VovkSchema } from '../types/core.js';
import { type HttpMethod, HttpStatus } from '../types/enums.js';
import type { VovkControllerParams, VovkControllerQuery } from '../types/inference.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny } from '../types/utils.js';
import type { CombinedSpec, VovkValidateOnClient } from '../types/validation.js';
import { deepExtend } from '../utils/deep-extend.js';
import { defaultHandler } from './default-handler.js';
import { defaultStreamHandler } from './default-stream-handler.js';
import { fetcher as defaultFetcher } from './fetcher.js';
import { serializeQuery } from './serialize-query.js';

export type { CombinedSpec, VovkHandlerSchema, VovkRequest };

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');

// "", "." and ".." (also percent-encoded) would drop or climb a path segment and so reach another route
const isUnsafeSegment = (value: string) => /^(?:\.|%2e){0,2}$/i.test(value);

const getHandlerPath = <T extends ControllerStaticMethod>(
  endpoint: string,
  params?: VovkControllerParams<T>,
  query?: VovkControllerQuery<T>
) => {
  let result = endpoint;
  const queryStr = query ? serializeQuery(query) : null;
  for (const [key, value] of Object.entries(params ?? {})) {
    const placeholder = `{${key}}`;
    // a missing value keeps its placeholder, which the fetcher reports
    if (!result.includes(placeholder) || value === undefined || value === null) continue;
    const segment = String(value);
    if (isUnsafeSegment(segment)) {
      throw new HttpException(
        HttpStatus.NULL,
        `Param "${key}" can't be empty, "." or "..", got ${JSON.stringify(segment)} in ${endpoint}`,
        { params }
      );
    }
    // encode so a value stays one path segment, the callback form also keeps $& from being a replacement pattern
    result = result.replaceAll(placeholder, () => encodeURIComponent(segment));
  }
  return `${result}${queryStr ? `?${queryStr}` : ''}`;
};

const FORM_CONTENT_TYPES = ['multipart/form-data', 'application/x-www-form-urlencoded'];

// a form field is text or a file: null and undefined are left out, a Date is sent as ISO and other objects as JSON
const toFormValue = (value: unknown): string | Blob | null => {
  if (value === undefined || value === null) return null;
  if (value instanceof Blob) return value;
  if (value instanceof Date) return value.toJSON();
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

const isFormSource = (body: unknown): body is Record<string, unknown> =>
  typeof body === 'object' &&
  body !== null &&
  !(body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob);

// urlencoded when the procedure takes no multipart, since then the server answers multipart with 415
const toFormBody = (source: Record<string, unknown>, contentTypes: string[]) => {
  const form = contentTypes.includes('multipart/form-data') ? new FormData() : new URLSearchParams();
  for (const [key, value] of Object.entries(source)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      const formValue = toFormValue(item);
      if (formValue === null) continue;
      if (form instanceof FormData) form.append(key, formValue);
      else form.append(key, String(formValue));
    }
  }
  return form;
};

/**
 * Creates a client-side RPC module for interacting with server-side controllers.
 * @see https://vovk.dev/typescript
 */
export const createRPC = <T, OPTS extends Record<string, KnownAny> = Record<string, never>>(
  givenSchema: unknown,
  segmentName: string,
  rpcModuleName: string,
  givenFetcher?: VovkFetcher<OPTS> | Promise<{ fetcher: VovkFetcher<OPTS> }>,
  options?: VovkFetcherOptions<OPTS> & { segmentNameOverride?: string }
): VovkRPCModule<T, OPTS> => {
  const schema = givenSchema as VovkSchema; // fixes incompatibilities with JSON module
  // fetcher ??= defaultFetcher as NonNullable<typeof fetcher>;
  const segmentNamePath = options?.segmentNameOverride ?? segmentName;
  const segmentSchema = schema.segments[segmentName];
  if (!segmentSchema)
    throw new Error(`Unable to create RPC module. Segment schema is missing for segment "${segmentName}".`);
  let controllerSchema = schema.segments[segmentName]?.controllers[rpcModuleName];
  const client = {} as VovkRPCModule<T, OPTS>;
  if (!controllerSchema) {
    console.warn(
      `🐺 Unable to create RPC module. Controller schema is missing for module "${rpcModuleName}" from segment "${segmentName}". Assuming that schema is not ready yet and a segment is importing an uncompiled RPC module.`
    );

    controllerSchema = {
      rpcModuleName,
      prefix: '',
      handlers: {},
    };
  }
  const controllerPrefix = trimPath(controllerSchema.prefix ?? '');

  const forceApiRoot = segmentSchema.forceApiRoot;
  const configRootEntry = schema.meta?.config?.rootEntry;
  const originalApiRoot = forceApiRoot ?? options?.apiRoot ?? (configRootEntry ? `/${configRootEntry}` : '/api');

  for (const [staticMethodName, handlerSchema] of Object.entries(controllerSchema.handlers ?? {})) {
    const { path, httpMethod, validation } = handlerSchema;
    const getURL = ({ apiRoot, params, query }: { apiRoot?: string; params?: unknown; query?: unknown } = {}) => {
      apiRoot = apiRoot ?? originalApiRoot;
      // a root without a host is a path on the current origin, so "api" must not become the protocol-relative "//api"
      const hasHost = /^([a-z][a-z\d+.-]*:)?\/\//i.test(apiRoot);
      const endpoint = [
        apiRoot,
        forceApiRoot ? '' : segmentNamePath,
        getHandlerPath([controllerPrefix, path].filter(Boolean).join('/'), params, query),
      ]
        .filter(Boolean)
        .join('/')
        .replace(/([^:])\/+/g, '$1/'); // replace // by / but not for protocols (http://, https://)
      return hasHost ? endpoint : `/${endpoint.replace(/^\/+/, '')}`;
    };

    const handler = (async (
      input: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: unknown;
        validateOnClient?: VovkValidateOnClient<OPTS>;
        transform?: (respData: unknown, resp: Response) => unknown;
      } & OPTS = {} as OPTS
    ) => {
      const optionsResolvedValidateOnClient =
        options?.validateOnClient instanceof Promise
          ? ((await options?.validateOnClient)?.validateOnClient as VovkValidateOnClient<OPTS>)
          : options?.validateOnClient;
      const fetcher =
        givenFetcher instanceof Promise
          ? (await givenFetcher).fetcher
          : (givenFetcher ?? (defaultFetcher as unknown as VovkFetcher<OPTS>));

      const contentTypes: string[] = validation?.body?.['x-contentType'] ?? [];
      // an object sent as form data is validated as the object, so numbers and arrays keep their types
      const formSource =
        contentTypes.some((type) => FORM_CONTENT_TYPES.includes(type)) && isFormSource(input.body) ? input.body : null;
      const body = formSource ? toFormBody(formSource, contentTypes) : input.body;

      const validate: Parameters<typeof fetcher>[0]['validate'] = async (
        validationInput,
        {
          endpoint,
        }: {
          endpoint: string;
        }
      ) => {
        const validateOnClient = input.validateOnClient ?? optionsResolvedValidateOnClient;
        if (validateOnClient && validation) {
          if (typeof validateOnClient !== 'function') {
            throw new Error('validateOnClient must be a function');
          }
          const validatesFormSource = formSource !== null && validationInput.body === body;
          const toValidate = validatesFormSource ? { ...validationInput, body: formSource } : { ...validationInput };
          const validated =
            (await validateOnClient(toValidate, validation, { fullSchema: schema, endpoint })) ?? toValidate;
          return validatesFormSource && isFormSource(validated.body)
            ? { ...validated, body: toFormBody(validated.body, contentTypes) }
            : validated;
        }

        return validationInput;
      };

      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName,
        httpMethod: httpMethod as HttpMethod,
        getURL,
        validate,
        defaultHandler,
        defaultStreamHandler,
        schema: handlerSchema,
      };

      const internalInput = {
        ...(deepExtend(
          {},
          options,
          {
            validateOnClient: optionsResolvedValidateOnClient,
          },
          input
        ) as OPTS),
        body: body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
      };

      if (!fetcher) throw new Error('Fetcher is not provided');

      const [respData, resp] = await fetcher(internalOptions, internalInput);

      return input.transform ? input.transform(respData, resp) : respData;
    }) as ClientMethod<KnownAny, KnownAny, KnownAny>;

    // TODO use Object.freeze, Object.seal or Object.defineProperty to avoid mutation
    handler.schema = handlerSchema;
    handler.controllerSchema = controllerSchema;
    handler.segmentSchema = segmentSchema;
    handler.fullSchema = schema;
    handler.isRPC = true;
    handler.apiRoot = originalApiRoot;
    handler.getURL = getURL;
    handler.queryKey = (key?: unknown[]) => [
      handler.segmentSchema.segmentName,
      handler.controllerSchema.prefix ?? '',
      handler.controllerSchema.rpcModuleName,
      handler.schema.path,
      handler.schema.httpMethod,
      ...(key ?? []),
    ];

    // @ts-expect-error TODO
    client[staticMethodName] = handler;
  }

  Object.defineProperty(client, 'withDefaults', {
    value: (newOptions?: VovkFetcherOptions<OPTS>) => {
      // deep merge to match per-call option merging, so chained defaults don't clobber nested keys
      return createRPC<T, OPTS>(
        schema,
        segmentName,
        rpcModuleName,
        givenFetcher,
        deepExtend({}, options, newOptions) as VovkFetcherOptions<OPTS>
      );
    },
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return client;
};
