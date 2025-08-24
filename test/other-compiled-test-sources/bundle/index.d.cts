import * as undici_types0 from "undici-types";
import * as vovk0 from "vovk";
import { JSONLinesResponse, VovkRequest } from "vovk";
import { NextResponse } from "next/server.js";
import { NextRequest, NextResponse as NextResponse$1 } from "next/server";
import * as openapi3_ts_oas310 from "openapi3-ts/oas31";
import { OpenAPIObject, OperationObject } from "openapi3-ts/oas31";
import { PackageJson } from "type-fest";
import { build } from "tsdown";
import * as _standard_schema_spec0 from "@standard-schema/spec";
import * as zod0 from "zod";
import * as zod_v4_core0 from "zod/v4/core";
import * as zod_v30 from "zod/v3";
import * as yup0 from "yup";
import * as class_transformer0 from "class-transformer";

//#region src/lib.d.ts
declare const NESTED_QUERY_EXAMPLE: {
  x: string;
  y: string[];
  z: {
    f: string;
    u: string[];
    d: {
      x: string;
      arrOfObjects: ({
        foo: string;
        nestedArr: string[];
        nestedObj?: undefined;
      } | {
        foo: string;
        nestedObj: {
          deepKey: string;
        };
        nestedArr?: undefined;
      })[];
    };
  };
};
/**
 * Returns an object that follows the ComplaiingModel schema but violates exactly
 * one validation constraint specified by the key parameter.
 */
//#endregion
//#region src/client/CommonController.d.ts
declare class CommonController {
  static getHelloWorldResponseObject(): NextResponse<{
    hello: string;
  }>;
  static getHelloWorldObjectLiteral(): {
    hello: string;
  };
  static getHelloWorldNextResponseObjectPromise(): Promise<NextResponse<{
    hello: string;
  }>>;
  static getHelloWorldRawResponseObjectPromise(): Promise<undici_types0.Response>;
  static getHelloWorldObjectLiteralPromise(): Promise<{
    hello: string;
  }>;
  static getHelloWorldHeaders(): Promise<{
    hello: string;
  }>;
  static getHelloWorldArray(): {
    hello: string;
  }[];
  static getHelloWorldAndEmptyGeneric(_req: VovkRequest): {
    hello: string;
  };
  static getWithParams(_req: VovkRequest, {
    hello
  }: {
    hello: 'world';
  }): {
    hello: "world";
  };
  static postWithAll(req: VovkRequest<{
    isBody: true;
  }, {
    simpleQueryParam: 'queryValue';
  }, {
    hello: 'world';
  }>, params: {
    hello: 'world';
  }): Promise<{
    params: {
      hello: "world";
    };
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: "queryValue";
    };
  }>;
  static postWithBodyAndQueryUsingReqVovk(req: VovkRequest<{
    isBody: true;
  }, {
    simpleQueryParam: 'queryValue';
    array1: readonly ['foo'];
    array2: readonly ['bar', 'baz'];
  }>): Promise<{
    body: {
      isBody: true;
    };
    query: {
      simpleQueryParam: "queryValue";
      array1: readonly ["foo"];
      array2: readonly ["bar", "baz"];
    };
    meta: {
      isMeta1: true;
      isMeta2: true;
    };
    metaNulled: Record<any, any>;
  }>;
  static getNestedQuery(req: VovkRequest<undefined, typeof NESTED_QUERY_EXAMPLE>): {
    query: {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: ({
            foo: string;
            nestedArr: string[];
            nestedObj?: undefined;
          } | {
            foo: string;
            nestedObj: {
              deepKey: string;
            };
            nestedArr?: undefined;
          })[];
        };
      };
    };
    search: string;
  };
  static postWithFormDataUsingReqVovk(req: VovkRequest<FormData>): Promise<{
    field: "value";
  }>;
  static getErrorResponse(): void;
  static getJsonTextResponse(): undici_types0.Response;
  static getJsonlResponse(): JSONLinesResponse<{
    hello: string;
  }>;
  static getJsonlTextResponse(): JSONLinesResponse<{
    hello: string;
  }>;
}
//# sourceMappingURL=CommonController.d.ts.map
//#endregion
//#region ../packages/vovk/mjs/JSONLinesResponse.d.ts
declare class JSONLinesResponse$1<T> extends Response {
  isClosed: boolean;
  controller?: ReadableStreamDefaultController | null;
  readonly encoder: TextEncoder | null;
  readonly readableStream: ReadableStream | null;
  private iteratorQueue;
  private iteratorResolvers;
  constructor(request?: Request, init?: ResponseInit);
  send: (data: T | StreamAbortMessage) => void;
  close: () => void;
  throw: (e: KnownAny) => void;
  [Symbol.dispose]: () => void;
  [Symbol.asyncDispose]: () => void;
  [Symbol.asyncIterator]: () => {
    next: () => Promise<IteratorResult<T | StreamAbortMessage>>;
  };
}
//#endregion
//#region ../packages/vovk/mjs/types.d.ts
type KnownAny = any;
type StaticClass = Function;
type VovkHandlerSchema<T = KnownAny> = {
  path: string;
  httpMethod: string;
  validation?: {
    query?: T;
    body?: T;
    params?: T;
    output?: T;
    iteration?: T;
  };
  openapi?: OperationObject;
  misc?: Record<string, KnownAny>;
};
type VovkControllerSchema<T = KnownAny> = {
  rpcModuleName: string;
  originalControllerName?: string;
  prefix?: string;
  forceApiRoot?: string;
  handlers: Record<string, VovkHandlerSchema<T>>;
};
type VovkSegmentSchema<T = KnownAny> = {
  $schema: typeof VovkSchemaIdEnum.SEGMENT | (string & {});
  emitSchema: boolean;
  segmentName: string;
  segmentType: 'segment' | 'mixin' | (string & {});
  forceApiRoot?: string;
  controllers: Record<string, VovkControllerSchema<T>>;
  meta?: {
    components?: OpenAPIObject['components'];
    package?: PackageJson;
    [key: string]: KnownAny;
  };
};
type VovkMetaSchema = {
  $schema: typeof VovkSchemaIdEnum.META | (string & {});
  config: RequireFields<Partial<VovkStrictConfig>, '$schema'>;
  package?: PackageJson;
  apiRoot?: string;
  openapi?: OpenAPIObject;
  [key: string]: KnownAny;
};
type VovkSchema<T = KnownAny> = {
  $schema: typeof VovkSchemaIdEnum.SCHEMA | (string & {});
  segments: Record<string, VovkSegmentSchema<T>>;
  meta?: VovkMetaSchema;
};
type VovkControllerInternal = {
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  _prefix?: VovkControllerSchema['prefix'];
  _handlers: VovkControllerSchema['handlers'];
  _handlersMetadata?: Record<string, {
    staticParams?: Record<string, string>[];
  }>;
  _onError?: (err: Error, req: VovkRequest$1) => void | Promise<void>;
};
type VovkController = StaticClass & VovkControllerInternal & {
  [key: string]: unknown;
};
interface VovkRequest$1<BODY extends KnownAny = undefined, QUERY extends KnownAny = undefined, PARAMS extends KnownAny = undefined> extends Omit<NextRequest, 'json' | 'nextUrl'> {
  json: () => Promise<BODY>;
  nextUrl: Omit<NextRequest['nextUrl'], 'searchParams'> & {
    searchParams: Omit<NextRequest['nextUrl']['searchParams'], 'get' | 'getAll' | 'entries' | 'forEach' | 'keys' | 'values'> & {
      get: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends readonly (infer ITEM)[] ? ITEM : QUERY[KEY];
      getAll: <KEY extends keyof QUERY>(key: KEY) => QUERY[KEY] extends KnownAny[] ? QUERY[KEY] : QUERY[KEY][];
      entries: () => IterableIterator<[keyof QUERY, QUERY[keyof QUERY]]>;
      forEach: (callbackfn: (value: QUERY[keyof QUERY], key: keyof QUERY, searchParams: NextRequest['nextUrl']['searchParams']) => void) => void;
      keys: () => IterableIterator<keyof QUERY>;
      values: () => IterableIterator<QUERY[keyof QUERY]>;
    };
  };
  vovk: {
    body: () => Promise<BODY>;
    query: () => QUERY;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    form: <T = BODY>() => Promise<T>;
    params: () => PARAMS;
  };
}
type ControllerStaticMethod<REQ extends VovkRequest$1<KnownAny, KnownAny, KnownAny> = VovkRequest$1<unknown, unknown, unknown>, PARAMS extends {
  [key: string]: string;
} = KnownAny> = ((req: REQ, params: PARAMS) => unknown) & {
  _controller?: VovkController;
};
type StreamAbortMessage = {
  isError: true;
  reason: KnownAny;
};
declare enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}
declare enum VovkSchemaIdEnum {
  META = "https://vovk.dev/api/schema/v3/meta.json",
  CONFIG = "https://vovk.dev/api/schema/v3/config.json",
  SEGMENT = "https://vovk.dev/api/schema/v3/segment.json",
  SCHEMA = "https://vovk.dev/api/schema/v3/schema.json",
}
type ReadmeConfig = {
  banner?: string;
};
type ClientConfigCommon = {
  enabled?: boolean;
  outDir?: string;
  fromTemplates?: string[];
  prettifyClient?: boolean;
} & ({
  excludeSegments?: never;
  includeSegments?: string[];
} | {
  excludeSegments?: string[];
  includeSegments?: never;
});
type ClientConfigComposed = ClientConfigCommon & {
  package?: PackageJson;
  readme?: ReadmeConfig;
};
type ClientConfigSegmented = ClientConfigCommon & {
  packages?: Record<string, PackageJson>;
  readmes?: Record<string, ReadmeConfig>;
};
type BundleConfig = {
  requires?: Record<string, string>;
  prebundleOutDir?: string;
  keepPrebundleDir?: boolean;
  origin?: string;
  package?: PackageJson;
  readme?: ReadmeConfig;
  reExports?: Record<string, string>;
  tsdownBuildOptions?: Parameters<typeof build>[0];
} & ({
  excludeSegments?: never;
  includeSegments?: string[];
} | {
  excludeSegments?: string[];
  includeSegments?: never;
});
type SegmentConfigItem = {
  origin?: string;
  rootEntry?: string;
  segmentNameOverride?: string;
  reExports?: Record<string, string>;
};
type SegmentConfig = Record<string, SegmentConfigItem>;
type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  origin?: string | null;
  composedClient?: Omit<ClientConfigComposed, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  segmentConfig?: false | SegmentConfig;
  requires?: Record<string, string>;
};
type GetOpenAPINameFn = (config: {
  operationObject: OperationObject;
  method: HttpMethod;
  path: string;
  openAPIObject: OpenAPIObject;
}) => string;
type VovkUserConfig = {
  $schema?: typeof VovkSchemaIdEnum.CONFIG | (string & {});
  emitConfig?: boolean | (keyof VovkStrictConfig | (string & {}))[];
  schemaOutDir?: string;
  modulesDir?: string;
  rootEntry?: string;
  origin?: string;
  logLevel?: 'error' | 'trace' | 'debug' | 'info' | 'warn' | (string & {});
  libs?: {
    ajv: KnownAny;
    [key: string]: KnownAny;
  };
  devHttps?: boolean;
  composedClient?: ClientConfigComposed;
  segmentedClient?: ClientConfigSegmented;
  bundle?: BundleConfig;
  clientTemplateDefs?: Record<string, ClientTemplateDef>;
  imports?: {
    fetcher?: string | [string, string] | [string];
    validateOnClient?: string | [string, string] | [string];
    createRPC?: string | [string, string] | [string];
  };
  rootSegmentModulesDirName?: string;
  moduleTemplates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  segmentConfig?: false | SegmentConfig;
  openApiMixins?: {
    [mixinName: string]: {
      source: {
        file: string;
      } | {
        url: string;
        fallback?: string;
      } | {
        object: OpenAPIObject;
      };
      package?: PackageJson;
      readme?: ReadmeConfig;
      apiRoot?: string;
      getModuleName?: 'nestjs-operation-id' | (string & {}) | 'api' | GetOpenAPINameFn;
      getMethodName?: 'nestjs-operation-id' | 'camel-case-operation-id' | 'auto' | GetOpenAPINameFn;
      errorMessageKey?: string;
    };
  };
};
type VovkConfig = VovkUserConfig;
type VovkStrictConfig = Required<Omit<VovkUserConfig, 'emitConfig' | 'libs' | 'imports' | 'composedClient' | 'segmentedClient' | 'bundle' | 'extendClientWithOpenAPI'>> & {
  emitConfig: (keyof VovkStrictConfig | string)[];
  bundle: RequireAllExcept<NonNullable<VovkUserConfig['bundle']>, 'includeSegments' | 'excludeSegments' | 'origin'>;
  imports: {
    fetcher: [string, string] | [string];
    validateOnClient: [string, string] | [string] | null;
    createRPC: [string, string] | [string];
  };
  libs: Record<string, KnownAny>;
  composedClient: RequireFields<ClientConfigComposed, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  openApiMixins: {
    [mixinName: string]: {
      source: Exclude<NonNullable<VovkConfig['openApiMixins']>[string]['source'], {
        file: string;
      } | {
        url: string;
      }>;
      apiRoot?: string;
      getModuleName: NonNullable<VovkConfig['openApiMixins']>[string]['getModuleName'];
      getMethodName: NonNullable<VovkConfig['openApiMixins']>[string]['getMethodName'];
    };
  };
};
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type RequireAllExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;
type IsEmptyObject<T> = T extends object ? keyof T extends never ? true : T extends Partial<T> ? Partial<T> extends T ? true : false : false : false;
type Prettify<T> = { [K in keyof T]: T[K] } & {};
//#endregion
//#region ../packages/vovk/mjs/client/defaultStreamHandler.d.ts
declare const defaultStreamHandler: ({
  response,
  controller
}: {
  response: Response;
  controller: AbortController;
  schema: VovkHandlerSchema;
}) => Promise<VovkStreamAsyncIterable<unknown>>;
//#endregion
//#region ../packages/vovk/mjs/client/defaultHandler.d.ts
declare const defaultHandler: ({
  response,
  schema
}: {
  response: Response;
  schema: VovkHandlerSchema;
}) => Promise<unknown>;
//#endregion
//#region ../packages/vovk/mjs/client/types.d.ts
type OmitNullable<T> = { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K] };
type Empty = {};
type StaticMethodInput<T extends ((req: VovkRequest$1<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
  __types?: {
    isForm: boolean;
  };
}> = OmitNullable<(Parameters<T>[0] extends VovkRequest$1<infer BODY, infer QUERY, infer PARAMS> ? (BODY extends Record<KnownAny, KnownAny> ? {
  body: T['__types'] extends {
    isForm: true;
  } ? FormData : BODY;
} : Empty) & (QUERY extends Record<KnownAny, KnownAny> ? {
  query: QUERY;
} : Empty) & (PARAMS extends Record<KnownAny, KnownAny> ? {
  params: PARAMS;
} : Empty) & {
  meta?: {
    [key: string]: KnownAny;
  };
} : Empty) & (Parameters<T>[1] extends Record<KnownAny, KnownAny> ? {
  params: Parameters<T>[1];
} : Empty)>;
type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;
type VovkStreamAsyncIterable<T> = {
  status: number;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  cancel: () => Promise<void> | void;
};
type StaticMethodReturn<T extends ControllerStaticMethod> = ReturnType<T> extends NextResponse$1<infer U> | Promise<NextResponse$1<infer U>> ? U : ReturnType<T> extends Response | Promise<Response> ? Awaited<ReturnType<T>> : ReturnType<T>;
type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;
type StaticMethodOptions<T extends (req: VovkRequest$1<KnownAny, KnownAny, KnownAny>, params: KnownAny) => void | object | JSONLinesResponse$1<TStreamIteration> | Promise<JSONLinesResponse$1<TStreamIteration>>, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration, R, F extends VovkDefaultFetcherOptions<KnownAny>> = Partial<TFetcherOptions & {
  transform: (staticMethodReturn: Awaited<StaticMethodReturn<T>>, resp: Response) => R;
  fetcher: VovkClientFetcher<F>;
}>;
type ClientMethodReturn<T extends (req: VovkRequest$1<KnownAny, KnownAny, KnownAny>, params: KnownAny) => void | object | JSONLinesResponse$1<TStreamIteration> | Promise<JSONLinesResponse$1<TStreamIteration>>, TStreamIteration, R> = ReturnType<T> extends Promise<JSONLinesResponse$1<infer U>> | JSONLinesResponse$1<infer U> | Iterator<infer U> | AsyncIterator<infer U> ? Promise<VovkStreamAsyncIterable<U>> : R extends object ? Promise<Awaited<R>> : StaticMethodReturnPromise<T>;
type ClientMethod<T extends ((req: VovkRequest$1<KnownAny, KnownAny, KnownAny>, params: KnownAny) => void | object | JSONLinesResponse$1<TStreamIteration> | Promise<JSONLinesResponse$1<TStreamIteration>>) & {
  __types?: {
    body: KnownAny;
    query: KnownAny;
    params: KnownAny;
    output: KnownAny;
    iteration: KnownAny;
    isForm: boolean;
  };
}, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration extends KnownAny = unknown> = (IsEmptyObject<StaticMethodInput<T>> extends true ? <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<TFetcherOptions>>(options?: Prettify<StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R> : <R, F extends VovkDefaultFetcherOptions<KnownAny> = VovkDefaultFetcherOptions<TFetcherOptions>>(options: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  path: string;
  queryKey: (key?: unknown[]) => unknown[];
  __types: T['__types'];
};
type VovkClientFetcher<TFetcherOptions> = (options: {
  name: string;
  httpMethod: HttpMethod;
  getEndpoint: (data: {
    apiRoot: string | undefined;
    params: unknown;
    query: unknown;
  }) => string;
  validate: (inputOptions: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
    meta?: unknown;
  } & TFetcherOptions, meta: {
    endpoint: string;
  }) => KnownAny | Promise<KnownAny>;
  defaultStreamHandler: typeof defaultStreamHandler;
  defaultHandler: typeof defaultHandler;
  schema: VovkHandlerSchema;
}, input: {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  meta?: unknown;
} & TFetcherOptions) => Promise<[KnownAny, Response]>;
type VovkDefaultFetcherOptions<T> = T & {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<T>;
  interpretAs?: string;
  init?: RequestInit;
};
type VovkValidateOnClient<TFetcherOptions> = (input: {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  meta?: unknown;
} & TFetcherOptions, validation: Omit<Exclude<VovkHandlerSchema['validation'], undefined>, 'output' | 'iteration'>, meta: {
  fullSchema: VovkSchema;
  endpoint: string;
}) => KnownAny | Promise<KnownAny>;
//#endregion
//#region src/client/StreamingController.d.ts
type Token$1 = {
  token: string;
  query: 'queryValue';
};
declare class StreamingController {
  static postWithStreaming(req: VovkRequest<Omit<Token$1, 'query'>[], {
    query: 'queryValue';
  }>): Promise<JSONLinesResponse<Token$1>>;
  static postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token$1, 'query'>[], {
    query: 'queryValue';
  }>): Promise<JSONLinesResponse<Token$1>>;
  static postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token$1, 'query'>[], {
    query: 'queryValue';
  }>): Promise<JSONLinesResponse<Token$1>>;
  static postWithStreamingAndDelayedCustomError(req: VovkRequest<Omit<Token$1, 'query'>[], {
    query: 'queryValue';
  }>): Promise<JSONLinesResponse<Token$1>>;
  static postWithStreamingAndDelayedUnhandledError(req: VovkRequest<Omit<Token$1, 'query'>[], {
    query: 'queryValue';
  }>): Promise<JSONLinesResponse<Token$1>>;
}
//# sourceMappingURL=StreamingController.d.ts.map
//#endregion
//#region src/client/StreamingGeneratorController.d.ts
type Token = {
  token: string;
  query: 'queryValue';
};
declare class StreamingGeneratorController {
  static getWithStreaming(req: VovkRequest<null, {
    query: 'queryValue';
  }>): AsyncGenerator<Token, void, unknown>;
  static postWithAsyncStreaming(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<{
    query: "queryValue";
    token: string;
  }, void, unknown>;
  static postWithStreaming(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<{
    query: "queryValue";
    token: string;
  }, void, unknown>;
  static postWithStreamingAndImmediateError(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<Token, void, unknown>;
  static postWithStreamingAndDelayedError(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<{
    query: "queryValue";
    token: string;
  }, void, unknown>;
  static postWithStreamingAndDelayedCustomError(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<{
    query: "queryValue";
    token: string;
  }, void, unknown>;
  static postWithStreamingAndDelayedUnhandledError(req: VovkRequest<Omit<Token, 'query'>[], {
    query: 'queryValue';
  }>): AsyncGenerator<{
    query: "queryValue";
    token: string;
  }, void, unknown>;
}
//# sourceMappingURL=StreamingGeneratorController.d.ts.map
//#endregion
//#region src/client/CustomSchemaController.d.ts
declare class CustomSchemaController {
  static getWithCustomSchema(): any;
}
//# sourceMappingURL=CustomSchemaController.d.ts.map

//#endregion
//#region src/client/WithDtoClientController.dto.d.ts
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
declare class HandleAllBodyDto {
  hello: string;
}
declare class HandleAllQueryDto {
  search: string;
}
declare class HandleAllParamsDto {
  foo: string;
  bar: string;
}
declare class HandleAllOutputDto {
  body: HandleAllBodyDto;
  query: HandleAllQueryDto;
  params: HandleAllParamsDto;
  vovkParams: HandleAllParamsDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleQuery
 * -------------------------------------------------------------------------
 */
declare class HandleQueryQueryDto {
  search: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
declare class HandleBodyBodyDto {
  hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
declare class HandleParamsDto {
  foo: string;
  bar: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleNestedQuery
 * -------------------------------------------------------------------------
 */

declare class DDto {
  x: string;
}
declare class ZDto {
  f: string;
  u: string[];
  d: DDto;
}
declare class HandleNestedQueryDto {
  x: string;
  y: string[];
  z: ZDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleOutput
 * -------------------------------------------------------------------------
 */
declare class HandleOutputQueryDto {
  helloOutput: string;
}
declare class HandleOutputOutputDto {
  hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleStream
 * -------------------------------------------------------------------------
 */
declare class HandleStreamQueryDto {
  values: string[];
}
/**
 * -------------------------------------------------------------------------
 * DTOs for handleStream with iteration
 * -------------------------------------------------------------------------
 * */
declare class IterationDto {
  value: 'a' | 'b' | 'c' | 'd';
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for values with a, b, c, d
 * -------------------------------------------------------------------------
 */
declare class QueryValuesDto {
  values: string[];
}
declare class RequiredObject {
  requiredField: string;
  optionalField?: number;
}
declare class StrictObject {
  knownField: string;
}
declare class AllOfDtoA {
  a: string;
}
declare class AllOfDtoB {
  b: number;
}
declare class ConstrainingDto {
  enum_value: 'a' | 'b' | 'c';
  num_minimum: number;
  num_maximum: number;
  num_exclusiveMinimum: number;
  num_exclusiveMaximum: number;
  num_multipleOf: number;
  num_int: number;
  num_int32: number;
  str_minLength: string;
  str_maxLength: string;
  str_pattern: string;
  str_email: string;
  str_url: string;
  str_uuid: string;
  str_datetime: string;
  arr_minItems: string[];
  arr_maxItems: string[];
  obj_required: RequiredObject;
  obj_strict: StrictObject;
  logical_anyOf: string | number | boolean;
  logical_allOf: AllOfDtoA & AllOfDtoB;
}
//#endregion
//#region src/client/OpenApiController.d.ts
declare class OpenApiController {
  static getFromSchema(): openapi3_ts_oas310.OpenAPIObject;
}
//# sourceMappingURL=OpenApiController.d.ts.map
//#endregion
//#region tmp_prebundle/schema.d.ts
declare const schema$1: {
  $schema: string;
  segments: {
    'foo/client': {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      segmentType: string;
      controllers: {
        CommonControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getHelloWorldResponseObject: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldObjectLiteral: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldNextResponseObjectPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldRawResponseObjectPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldObjectLiteralPromise: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldHeaders: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldArray: {
              httpMethod: string;
              path: string;
            };
            getHelloWorldAndEmptyGeneric: {
              httpMethod: string;
              path: string;
            };
            getWithParams: {
              path: string;
              httpMethod: string;
            };
            postWithAll: {
              path: string;
              httpMethod: string;
            };
            postWithBodyAndQueryUsingReqVovk: {
              path: string;
              httpMethod: string;
            };
            getNestedQuery: {
              path: string;
              httpMethod: string;
            };
            postWithFormDataUsingReqVovk: {
              path: string;
              httpMethod: string;
            };
            getErrorResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonTextResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonlResponse: {
              path: string;
              httpMethod: string;
            };
            getJsonlTextResponse: {
              path: string;
              httpMethod: string;
            };
          };
        };
        StreamingControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            postWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndImmediateError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedCustomError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedUnhandledError: {
              httpMethod: string;
              path: string;
            };
          };
        };
        StreamingGeneratorControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithAsyncStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreaming: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndImmediateError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedCustomError: {
              httpMethod: string;
              path: string;
            };
            postWithStreamingAndDelayedUnhandledError: {
              httpMethod: string;
              path: string;
            };
          };
        };
        CustomSchemaControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getWithCustomSchema: {
              misc: {
                hello: string;
              };
              httpMethod: string;
              path: string;
            };
          };
        };
        WithZodClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
                            type: string;
                            properties: {
                              message: {
                                type: string;
                                enum: string[];
                              };
                              statusCode: {
                                type: string;
                                enum: number[];
                              };
                            };
                            $ref?: undefined;
                          })[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleQuery: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBodyZod3: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  $schema: string;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
            handleNestedQuery: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    z: {
                      type: string;
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          type: string;
                          items: {
                            type: string;
                          };
                        };
                        d: {
                          type: string;
                          properties: {
                            x: {
                              type: string;
                            };
                            arrOfObjects: {
                              type: string;
                              items: {
                                type: string;
                                properties: {
                                  foo: {
                                    type: string;
                                  };
                                  nestedArr: {
                                    type: string;
                                    items: {
                                      type: string;
                                    };
                                  };
                                  nestedObj: {
                                    type: string;
                                    properties: {
                                      deepKey: {
                                        type: string;
                                      };
                                    };
                                    required: string[];
                                    additionalProperties: boolean;
                                  };
                                };
                                required: string[];
                                additionalProperties: boolean;
                              };
                            };
                          };
                          required: string[];
                          additionalProperties: boolean;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                iteration: {
                  $schema: string;
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      type: string;
                      minimum: number;
                    };
                    num_maximum: {
                      type: string;
                      maximum: number;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                      exclusiveMinimum: number;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                      exclusiveMaximum: number;
                    };
                    num_multipleOf: {
                      type: string;
                      multipleOf: number;
                    };
                    num_int: {
                      type: string;
                      minimum: number;
                      maximum: number;
                    };
                    num_int32: {
                      type: string;
                      minimum: number;
                      maximum: number;
                    };
                    str_minLength: {
                      type: string;
                      minLength: number;
                    };
                    str_maxLength: {
                      type: string;
                      maxLength: number;
                    };
                    str_pattern: {
                      type: string;
                      pattern: string;
                    };
                    str_email: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    str_url: {
                      type: string;
                      format: string;
                    };
                    str_uuid: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    str_datetime: {
                      type: string;
                      format: string;
                      pattern: string;
                    };
                    arr_minItems: {
                      minItems: number;
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    arr_maxItems: {
                      maxItems: number;
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    obj_required: {
                      type: string;
                      properties: {
                        requiredField: {
                          type: string;
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    obj_strict: {
                      type: string;
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    logical_anyOf: {
                      anyOf: ({
                        type: string;
                        maxLength: number;
                      } | {
                        type: string;
                        maxLength?: undefined;
                      })[];
                    };
                    logical_allOf: {
                      allOf: ({
                        type: string;
                        properties: {
                          a: {
                            type: string;
                          };
                          b?: undefined;
                        };
                        required: string[];
                        additionalProperties: {};
                      } | {
                        type: string;
                        properties: {
                          b: {
                            type: string;
                          };
                          a?: undefined;
                        };
                        required: string[];
                        additionalProperties: {};
                      })[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  "x-isForm": boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleFormDataWithFile: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    file: {
                      type: string;
                      format: string;
                      contentEncoding: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  "x-isForm": boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    file: {
                      type: string;
                    };
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleFormDataWithMultipleFiles: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    files: {
                      type: string;
                      items: {
                        type: string;
                        format: string;
                        contentEncoding: string;
                      };
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  "x-isForm": boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                    files: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                iteration: {
                  $schema: string;
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
            handleAllAsFunction: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
            handleAllNoHttpAsFunction: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                    };
                    bar: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                        };
                        bar: {
                          type: string;
                        };
                      };
                      required: string[];
                      additionalProperties: boolean;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
            };
            handlePagination: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    page: {
                      type: string;
                    };
                    limit: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    items: {
                      type: string;
                      items: {
                        type: string;
                        properties: {
                          id: {
                            type: string;
                          };
                          name: {
                            type: string;
                          };
                        };
                        required: string[];
                        additionalProperties: boolean;
                      };
                    };
                    hasNextPage: {
                      type: string;
                    };
                    nextPage: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              httpMethod: string;
              path: string;
            };
          };
        };
        WithYupClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                params: {
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                output: {
                  type: string;
                  properties: {
                    body: {
                      type: string;
                      properties: {
                        hello: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    query: {
                      type: string;
                      properties: {
                        search: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    params: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                          maxLength: number;
                        };
                        bar: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                    vovkParams: {
                      type: string;
                      properties: {
                        foo: {
                          type: string;
                          maxLength: number;
                        };
                        bar: {
                          type: string;
                          maxLength: number;
                        };
                      };
                      required: string[];
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
                            type: string;
                            properties: {
                              message: {
                                type: string;
                                enum: string[];
                              };
                              statusCode: {
                                type: string;
                                enum: number[];
                              };
                            };
                            $ref?: undefined;
                          })[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleQuery: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  type: string;
                  properties: {
                    foo: {
                      type: string;
                      maxLength: number;
                    };
                    bar: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            handleNestedQuery: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                    z: {
                      type: string;
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          type: string;
                          items: {
                            type: string;
                          };
                        };
                        d: {
                          type: string;
                          properties: {
                            x: {
                              type: string;
                            };
                            arrOfObjects: {
                              type: string;
                              items: {
                                type: string;
                                default: {
                                  nestedObj: {};
                                };
                                properties: {
                                  foo: {
                                    type: string;
                                  };
                                  nestedArr: {
                                    type: string;
                                    items: {
                                      type: string;
                                    };
                                  };
                                  nestedObj: {
                                    type: string;
                                    default: {};
                                    properties: {
                                      deepKey: {
                                        type: string;
                                      };
                                    };
                                  };
                                };
                                required: string[];
                              };
                            };
                          };
                          required: string[];
                        };
                      };
                      required: string[];
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                output: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                };
                iteration: {
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  type: string;
                  default: {
                    logical_allOf: {};
                    obj_strict: {};
                    obj_required: {};
                  };
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      type: string;
                      minimum: number;
                    };
                    num_maximum: {
                      type: string;
                      maximum: number;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                      exclusiveMinimum: number;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                      exclusiveMaximum: number;
                    };
                    num_multipleOf: {
                      type: string;
                    };
                    num_int: {
                      type: string;
                    };
                    num_int32: {
                      type: string;
                      maximum: number;
                      minimum: number;
                    };
                    str_minLength: {
                      type: string;
                      minLength: number;
                    };
                    str_maxLength: {
                      type: string;
                      maxLength: number;
                    };
                    str_pattern: {
                      type: string;
                      pattern: string;
                    };
                    str_email: {
                      type: string;
                      format: string;
                    };
                    str_url: {
                      type: string;
                      format: string;
                    };
                    str_uuid: {
                      type: string;
                      pattern: string;
                    };
                    str_datetime: {
                      type: string;
                    };
                    arr_minItems: {
                      type: string;
                      items: {
                        type: string;
                      };
                      minItems: number;
                    };
                    arr_maxItems: {
                      type: string;
                      items: {
                        type: string;
                      };
                      maxItems: number;
                    };
                    obj_required: {
                      type: string;
                      default: {};
                      properties: {
                        requiredField: {
                          type: string;
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      required: string[];
                    };
                    obj_strict: {
                      type: string;
                      default: {};
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                    };
                    logical_anyOf: {
                      type: string;
                      maxLength: number;
                    };
                    logical_allOf: {
                      type: string;
                      properties: {
                        a: {
                          type: string;
                        };
                        b: {
                          type: string;
                        };
                      };
                      required: string[];
                    };
                  };
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                  "x-isForm": boolean;
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    hello: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    search: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  type: string;
                  properties: {
                    values: {
                      type: string;
                      items: {
                        type: string;
                      };
                    };
                  };
                  required: string[];
                };
                iteration: {
                  type: string;
                  properties: {
                    value: {
                      type: string;
                      maxLength: number;
                    };
                  };
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
          };
        };
        WithDtoClientControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            handleAll: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                params: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      maxLength: number;
                      type: string;
                    };
                    bar: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                output: {
                  "x-isDto": boolean;
                  definitions: {
                    HandleAllBodyDto: {
                      properties: {
                        hello: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    HandleAllQueryDto: {
                      properties: {
                        search: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    HandleAllParamsDto: {
                      properties: {
                        foo: {
                          maxLength: number;
                          type: string;
                        };
                        bar: {
                          maxLength: number;
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    body: {
                      $ref: string;
                    };
                    query: {
                      $ref: string;
                    };
                    params: {
                      $ref: string;
                    };
                    vovkParams: {
                      $ref: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                responses: {
                  "400": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
                            type: string;
                            properties: {
                              message: {
                                type: string;
                                enum: string[];
                              };
                              statusCode: {
                                type: string;
                                enum: number[];
                              };
                            };
                            $ref?: undefined;
                          })[];
                        };
                      };
                    };
                  };
                };
                summary: string;
                description: string;
              };
            };
            handleNestedQuery: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {
                    ZDto: {
                      properties: {
                        f: {
                          type: string;
                        };
                        u: {
                          items: {
                            type: string;
                          };
                          type: string;
                        };
                        d: {
                          $ref: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    DDto: {
                      properties: {
                        x: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    x: {
                      type: string;
                      maxLength: number;
                    };
                    y: {
                      items: {
                        type: string;
                      };
                      type: string;
                    };
                    z: {
                      $ref: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNestedQueryClient: {
              httpMethod: string;
              path: string;
            };
            handleOutput: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    helloOutput: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                output: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleOutputClient: {
              httpMethod: string;
              path: string;
            };
            handleStream: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    values: {
                      items: {
                        type: string;
                      };
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                iteration: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    value: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleSchemaConstraints: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {
                    RequiredObject: {
                      properties: {
                        requiredField: {
                          type: string;
                          not: {
                            type: string;
                          };
                        };
                        optionalField: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                    StrictObject: {
                      properties: {
                        knownField: {
                          type: string;
                        };
                      };
                      type: string;
                      required: string[];
                    };
                  };
                  properties: {
                    enum_value: {
                      type: string;
                      enum: string[];
                    };
                    num_minimum: {
                      minimum: number;
                      type: string;
                    };
                    num_maximum: {
                      maximum: number;
                      type: string;
                    };
                    num_exclusiveMinimum: {
                      type: string;
                    };
                    num_exclusiveMaximum: {
                      type: string;
                    };
                    num_multipleOf: {
                      type: string;
                    };
                    num_int: {
                      type: string;
                    };
                    num_int32: {
                      minimum: number;
                      type: string;
                      maximum: number;
                    };
                    str_minLength: {
                      minLength: number;
                      type: string;
                    };
                    str_maxLength: {
                      maxLength: number;
                      type: string;
                    };
                    str_pattern: {
                      pattern: string;
                      type: string;
                    };
                    str_email: {
                      format: string;
                      type: string;
                    };
                    str_url: {
                      format: string;
                      type: string;
                    };
                    str_uuid: {
                      format: string;
                      type: string;
                    };
                    str_datetime: {
                      oneOf: {
                        format: string;
                        type: string;
                      }[];
                    };
                    arr_minItems: {
                      items: {
                        type: string;
                      };
                      type: string;
                      maxItems: number;
                      minItems: number;
                    };
                    arr_maxItems: {
                      items: {
                        type: string;
                      };
                      type: string;
                      maxItems: number;
                      minItems: number;
                    };
                    obj_required: {
                      $ref: string;
                    };
                    obj_strict: {
                      $ref: string;
                    };
                    logical_allOf: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleNothitng: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            handleFormData: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                  "x-isForm": boolean;
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleFormDataClient: {
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationBool: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            disableServerSideValidationStrings: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionBool: {
              validation: {};
              httpMethod: string;
              path: string;
            };
            skipSchemaEmissionStrings: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            validateEachIteration: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    values: {
                      items: {};
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
                iteration: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    value: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleAllClient: {
              path: string;
              httpMethod: string;
            };
            handleQuery: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleQueryClient: {
              httpMethod: string;
              path: string;
            };
            handleBody: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    hello: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              httpMethod: string;
              path: string;
            };
            handleBodyClient: {
              httpMethod: string;
              path: string;
            };
            handleParams: {
              validation: {
                params: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      maxLength: number;
                      type: string;
                    };
                    bar: {
                      maxLength: number;
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
            };
            handleParamsClient: {
              path: string;
              httpMethod: string;
            };
          };
        };
        OpenApiControllerRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getFromSchema: {
              openapi: {
                responses: {
                  "418": {
                    description: string;
                    content: {
                      "application/json": {
                        schema: {
                          allOf: ({
                            $ref: string;
                            type?: undefined;
                            properties?: undefined;
                          } | {
                            type: string;
                            properties: {
                              message: {
                                type: string;
                                enum: string[];
                              };
                              statusCode: {
                                type: string;
                                enum: number[];
                              };
                            };
                            $ref?: undefined;
                          })[];
                        };
                      };
                    };
                  };
                };
                summary: string;
              };
              path: string;
              httpMethod: string;
            };
          };
        };
      };
    };
    generated: {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      segmentType: string;
      controllers: {
        NoValidationControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getNoValidationControllerOnlyEntities: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteNoValidationControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        NoValidationControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getNoValidationControllerAndServiceEntities: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteNoValidationControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ZodControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getZodControllerOnlyEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateZodControllerOnlyEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        type: string;
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createZodControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteZodControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ZodControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getZodControllerAndServiceEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateZodControllerAndServiceEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        type: string;
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createZodControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteZodControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        YupControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getYupControllerOnlyEntities: {
              validation: {
                query: {
                  type: string;
                  default: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateYupControllerOnlyEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      type: string[];
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  default: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createYupControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteYupControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        YupControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getYupControllerAndServiceEntities: {
              validation: {
                query: {
                  type: string;
                  default: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateYupControllerAndServiceEntity: {
              validation: {
                body: {
                  type: string;
                  properties: {
                    foo: {
                      type: string[];
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  type: string;
                  default: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createYupControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteYupControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        DtoControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getDtoControllerOnlyEntities: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateDtoControllerOnlyEntity: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createDtoControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteDtoControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        DtoControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getDtoControllerAndServiceEntities: {
              validation: {
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateDtoControllerAndServiceEntity: {
              validation: {
                body: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    foo: {
                      type: string;
                      enum: string[];
                    };
                  };
                  type: string;
                  required: string[];
                };
                query: {
                  "x-isDto": boolean;
                  definitions: {};
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  type: string;
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createDtoControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteDtoControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ValibotControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getValibotControllerOnlyEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateValibotControllerOnlyEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createValibotControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteValibotControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ValibotControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getValibotControllerAndServiceEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateValibotControllerAndServiceEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      anyOf: {
                        const: string;
                      }[];
                    };
                  };
                  required: string[];
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createValibotControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteValibotControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ArktypeControllerOnlyEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getArktypeControllerOnlyEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateArktypeControllerOnlyEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createArktypeControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
            deleteArktypeControllerOnlyEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
        ArktypeControllerAndServiceEntityRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getArktypeControllerAndServiceEntities: {
              validation: {
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    search: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            updateArktypeControllerAndServiceEntity: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    foo: {
                      enum: string[];
                    };
                  };
                  required: string[];
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    q: {
                      type: string;
                    };
                  };
                  required: string[];
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                    };
                  };
                  required: string[];
                };
              };
              path: string;
              httpMethod: string;
              openapi: {
                summary: string;
              };
            };
            createArktypeControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
            deleteArktypeControllerAndServiceEntity: {
              path: string;
              httpMethod: string;
            };
          };
        };
      };
    };
  };
  meta: {
    config: {
      libs: {};
      $schema: string;
    };
    $schema: string;
    apiRoot: string;
  };
};
//# sourceMappingURL=schema.d.ts.map
//#endregion
//#region tmp_prebundle/index.d.ts
declare const CommonControllerRPC: {
  getHelloWorldResponseObject: ClientMethod<typeof CommonController.getHelloWorldResponseObject, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldObjectLiteral: ClientMethod<typeof CommonController.getHelloWorldObjectLiteral, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldNextResponseObjectPromise: ClientMethod<typeof CommonController.getHelloWorldNextResponseObjectPromise, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldRawResponseObjectPromise: ClientMethod<typeof CommonController.getHelloWorldRawResponseObjectPromise, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldObjectLiteralPromise: ClientMethod<typeof CommonController.getHelloWorldObjectLiteralPromise, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldHeaders: ClientMethod<typeof CommonController.getHelloWorldHeaders, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldArray: ClientMethod<typeof CommonController.getHelloWorldArray, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getHelloWorldAndEmptyGeneric: ClientMethod<typeof CommonController.getHelloWorldAndEmptyGeneric, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getWithParams: ClientMethod<typeof CommonController.getWithParams, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithAll: ClientMethod<typeof CommonController.postWithAll, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithBodyAndQueryUsingReqVovk: ClientMethod<typeof CommonController.postWithBodyAndQueryUsingReqVovk, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getNestedQuery: ClientMethod<typeof CommonController.getNestedQuery, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithFormDataUsingReqVovk: ClientMethod<typeof CommonController.postWithFormDataUsingReqVovk, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getErrorResponse: ClientMethod<typeof CommonController.getErrorResponse, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getJsonTextResponse: ClientMethod<typeof CommonController.getJsonTextResponse, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getJsonlResponse: ClientMethod<typeof CommonController.getJsonlResponse, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  getJsonlTextResponse: ClientMethod<typeof CommonController.getJsonlTextResponse, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const StreamingControllerRPC: {
  postWithStreaming: ClientMethod<typeof StreamingController.postWithStreaming, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndImmediateError: ClientMethod<typeof StreamingController.postWithStreamingAndImmediateError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedError: ClientMethod<typeof StreamingController.postWithStreamingAndDelayedError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedCustomError: ClientMethod<typeof StreamingController.postWithStreamingAndDelayedCustomError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedUnhandledError: ClientMethod<typeof StreamingController.postWithStreamingAndDelayedUnhandledError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const StreamingGeneratorControllerRPC: {
  getWithStreaming: ClientMethod<typeof StreamingGeneratorController.getWithStreaming, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithAsyncStreaming: ClientMethod<typeof StreamingGeneratorController.postWithAsyncStreaming, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreaming: ClientMethod<typeof StreamingGeneratorController.postWithStreaming, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndImmediateError: ClientMethod<typeof StreamingGeneratorController.postWithStreamingAndImmediateError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedError: ClientMethod<typeof StreamingGeneratorController.postWithStreamingAndDelayedError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedCustomError: ClientMethod<typeof StreamingGeneratorController.postWithStreamingAndDelayedCustomError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  postWithStreamingAndDelayedUnhandledError: ClientMethod<typeof StreamingGeneratorController.postWithStreamingAndDelayedUnhandledError, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const CustomSchemaControllerRPC: {
  getWithCustomSchema: ClientMethod<typeof CustomSchemaController.getWithCustomSchema, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const WithZodClientControllerRPC: {
  handleAll: ClientMethod<(({
    vovk
  }: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, {
    foo: string;
    bar: string;
  }>, params: {
    foo: string;
    bar: string;
  }) => Promise<{
    body: {
      hello: string;
    };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    vovkParams: {
      foo: string;
      bar: string;
    };
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      foo: string;
      bar: string;
    }) => Promise<{
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      vovkParams: {
        foo: string;
        bar: string;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        body: zod0.ZodObject<{
          hello: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        query: zod0.ZodObject<{
          search: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        params: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        vovkParams: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
      }, zod_v4_core0.$strip>;
      params?: zod0.ZodObject<{
        foo: zod0.ZodString;
        bar: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleQuery: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    search: string;
  }, unknown>) => {
    search: string;
  }) & {
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleBody: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, unknown, unknown>) => Promise<{
    hello: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleBodyZod3: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, unknown, unknown>) => Promise<{
    hello?: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello?: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello?: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello?: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: never;
      output?: never;
      params?: never;
      query?: never;
      body?: zod_v30.ZodObject<{
        hello: zod_v30.ZodString;
      }, "strip", zod_v30.ZodTypeAny, {
        hello?: string;
      }, {
        hello?: string;
      }>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleParams: ClientMethod<((req: vovk0.VovkRequest<unknown, unknown, {
    foo: string;
    bar: string;
  }>) => Promise<{
    foo: string;
    bar: string;
  }>) & {
    __types: {
      body: unknown;
      query: unknown;
      params: {
        foo: string;
        bar: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      foo: string;
      bar: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        foo: string;
        bar: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: unknown;
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        foo: string;
        bar: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: unknown;
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: zod0.ZodObject<{
        foo: zod0.ZodString;
        bar: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNestedQuery: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    x: string;
    y: string[];
    z: {
      f: string;
      u: string[];
      d: {
        x: string;
        arrOfObjects: {
          foo: string;
          nestedArr?: string[];
          nestedObj?: {
            deepKey: string;
          };
        }[];
      };
    };
  }, unknown>) => {
    x: string;
    y: string[];
    z: {
      f: string;
      u: string[];
      d: {
        x: string;
        arrOfObjects: {
          foo: string;
          nestedArr?: string[];
          nestedObj?: {
            deepKey: string;
          };
        }[];
      };
    };
  }) & {
    __types: {
      body: unknown;
      query: {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              foo: string;
              nestedArr?: string[];
              nestedObj?: {
                deepKey: string;
              };
            }[];
          };
        };
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      x: string;
      y: string[];
      z: {
        f: string;
        u: string[];
        d: {
          x: string;
          arrOfObjects: {
            foo: string;
            nestedArr?: string[];
            nestedObj?: {
              deepKey: string;
            };
          }[];
        };
      };
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              foo: string;
              nestedArr?: string[];
              nestedObj?: {
                deepKey: string;
              };
            }[];
          };
        };
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          x: string;
          y: string[];
          z: {
            f: string;
            u: string[];
            d: {
              x: string;
              arrOfObjects: {
                foo: string;
                nestedArr?: string[];
                nestedObj?: {
                  deepKey: string;
                };
              }[];
            };
          };
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        x: string;
        y: string[];
        z: {
          f: string;
          u: string[];
          d: {
            x: string;
            arrOfObjects: {
              foo: string;
              nestedArr?: string[];
              nestedObj?: {
                deepKey: string;
              };
            }[];
          };
        };
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          x: string;
          y: string[];
          z: {
            f: string;
            u: string[];
            d: {
              x: string;
              arrOfObjects: {
                foo: string;
                nestedArr?: string[];
                nestedObj?: {
                  deepKey: string;
                };
              }[];
            };
          };
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        x: zod0.ZodString;
        y: zod0.ZodArray<zod0.ZodString>;
        z: zod0.ZodObject<{
          f: zod0.ZodString;
          u: zod0.ZodArray<zod0.ZodString>;
          d: zod0.ZodObject<{
            x: zod0.ZodString;
            arrOfObjects: zod0.ZodArray<zod0.ZodObject<{
              foo: zod0.ZodString;
              nestedArr: zod0.ZodOptional<zod0.ZodArray<zod0.ZodString>>;
              nestedObj: zod0.ZodOptional<zod0.ZodObject<{
                deepKey: zod0.ZodString;
              }, zod_v4_core0.$strip>>;
            }, zod_v4_core0.$strip>>;
          }, zod_v4_core0.$strip>;
        }, zod_v4_core0.$strip>;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleOutput: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    helloOutput: string;
  }, unknown>) => Promise<{
    hello: string;
  }>) & {
    __types: {
      body: unknown;
      query: {
        helloOutput: string;
      };
      params: unknown;
      output: {
        hello: string;
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          helloOutput: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          helloOutput: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        helloOutput: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleStream: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    values: string[];
  }, unknown>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: unknown;
      query: {
        values: string[];
      };
      params: unknown;
      output: unknown;
      iteration: {
        value: string;
      };
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          values: string[];
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          values: string[];
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: zod0.ZodObject<{
        value: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        values: zod0.ZodArray<zod0.ZodString>;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleSchemaConstraints: ClientMethod<((req: vovk0.VovkRequest<{
    enum_value: "a" | "b" | "c";
    num_minimum: number;
    num_maximum: number;
    num_exclusiveMinimum: number;
    num_exclusiveMaximum: number;
    num_multipleOf: number;
    num_int: number;
    num_int32: number;
    str_minLength: string;
    str_maxLength: string;
    str_pattern: string;
    str_email: string;
    str_url: string;
    str_uuid: string;
    str_datetime: string;
    arr_minItems: string[];
    arr_maxItems: string[];
    obj_required: {
      requiredField: string;
      optionalField?: number;
    };
    obj_strict: {
      knownField: string;
    };
    logical_anyOf?: string | number | boolean;
    logical_allOf?: {
      [x: string]: unknown;
      a: string;
    } & {
      [x: string]: unknown;
      b: number;
    };
  }, unknown, unknown>) => Promise<{
    enum_value: "a" | "b" | "c";
    num_minimum: number;
    num_maximum: number;
    num_exclusiveMinimum: number;
    num_exclusiveMaximum: number;
    num_multipleOf: number;
    num_int: number;
    num_int32: number;
    str_minLength: string;
    str_maxLength: string;
    str_pattern: string;
    str_email: string;
    str_url: string;
    str_uuid: string;
    str_datetime: string;
    arr_minItems: string[];
    arr_maxItems: string[];
    obj_required: {
      requiredField: string;
      optionalField?: number;
    };
    obj_strict: {
      knownField: string;
    };
    logical_anyOf?: string | number | boolean;
    logical_allOf?: {
      [x: string]: unknown;
      a: string;
    } & {
      [x: string]: unknown;
      b: number;
    };
  }>) & {
    __types: {
      body: {
        enum_value: "a" | "b" | "c";
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField: string;
          optionalField?: number;
        };
        obj_strict: {
          knownField: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          [x: string]: unknown;
          a: string;
        } & {
          [x: string]: unknown;
          b: number;
        };
      };
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      enum_value: "a" | "b" | "c";
      num_minimum: number;
      num_maximum: number;
      num_exclusiveMinimum: number;
      num_exclusiveMaximum: number;
      num_multipleOf: number;
      num_int: number;
      num_int32: number;
      str_minLength: string;
      str_maxLength: string;
      str_pattern: string;
      str_email: string;
      str_url: string;
      str_uuid: string;
      str_datetime: string;
      arr_minItems: string[];
      arr_maxItems: string[];
      obj_required: {
        requiredField: string;
        optionalField?: number;
      };
      obj_strict: {
        knownField: string;
      };
      logical_anyOf?: string | number | boolean;
      logical_allOf?: {
        [x: string]: unknown;
        a: string;
      } & {
        [x: string]: unknown;
        b: number;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        enum_value: "a" | "b" | "c";
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField: string;
          optionalField?: number;
        };
        obj_strict: {
          knownField: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          [x: string]: unknown;
          a: string;
        } & {
          [x: string]: unknown;
          b: number;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          enum_value: "a" | "b" | "c";
          num_minimum: number;
          num_maximum: number;
          num_exclusiveMinimum: number;
          num_exclusiveMaximum: number;
          num_multipleOf: number;
          num_int: number;
          num_int32: number;
          str_minLength: string;
          str_maxLength: string;
          str_pattern: string;
          str_email: string;
          str_url: string;
          str_uuid: string;
          str_datetime: string;
          arr_minItems: string[];
          arr_maxItems: string[];
          obj_required: {
            requiredField: string;
            optionalField?: number;
          };
          obj_strict: {
            knownField: string;
          };
          logical_anyOf?: string | number | boolean;
          logical_allOf?: {
            [x: string]: unknown;
            a: string;
          } & {
            [x: string]: unknown;
            b: number;
          };
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        enum_value: "a" | "b" | "c";
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField: string;
          optionalField?: number;
        };
        obj_strict: {
          knownField: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          [x: string]: unknown;
          a: string;
        } & {
          [x: string]: unknown;
          b: number;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          enum_value: "a" | "b" | "c";
          num_minimum: number;
          num_maximum: number;
          num_exclusiveMinimum: number;
          num_exclusiveMaximum: number;
          num_multipleOf: number;
          num_int: number;
          num_int32: number;
          str_minLength: string;
          str_maxLength: string;
          str_pattern: string;
          str_email: string;
          str_url: string;
          str_uuid: string;
          str_datetime: string;
          arr_minItems: string[];
          arr_maxItems: string[];
          obj_required: {
            requiredField: string;
            optionalField?: number;
          };
          obj_strict: {
            knownField: string;
          };
          logical_anyOf?: string | number | boolean;
          logical_allOf?: {
            [x: string]: unknown;
            a: string;
          } & {
            [x: string]: unknown;
            b: number;
          };
        };
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      body?: zod0.ZodObject<{
        enum_value: zod0.ZodEnum<{
          a: "a";
          b: "b";
          c: "c";
        }>;
        num_minimum: zod0.ZodNumber;
        num_maximum: zod0.ZodNumber;
        num_exclusiveMinimum: zod0.ZodNumber;
        num_exclusiveMaximum: zod0.ZodNumber;
        num_multipleOf: zod0.ZodNumber;
        num_int: zod0.ZodInt;
        num_int32: zod0.ZodInt32;
        str_minLength: zod0.ZodString;
        str_maxLength: zod0.ZodString;
        str_pattern: zod0.ZodString;
        str_email: zod0.ZodEmail;
        str_url: zod0.ZodURL;
        str_uuid: zod0.ZodUUID;
        str_datetime: zod0.ZodISODateTime;
        arr_minItems: zod0.ZodArray<zod0.ZodString>;
        arr_maxItems: zod0.ZodArray<zod0.ZodString>;
        obj_required: zod0.ZodObject<{
          requiredField: zod0.ZodString;
          optionalField: zod0.ZodOptional<zod0.ZodNumber>;
        }, zod_v4_core0.$strip>;
        obj_strict: zod0.ZodObject<{
          knownField: zod0.ZodString;
        }, zod_v4_core0.$strict>;
        logical_anyOf: zod0.ZodUnion<readonly [zod0.ZodString, zod0.ZodNumber, zod0.ZodBoolean]>;
        logical_allOf: zod0.ZodIntersection<zod0.ZodObject<{
          a: zod0.ZodString;
        }, zod_v4_core0.$loose>, zod0.ZodObject<{
          b: zod0.ZodNumber;
        }, zod_v4_core0.$loose>>;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNothitng: ClientMethod<(() => Promise<{
    readonly nothing: "here";
  }>) & {
    __types: {
      body: unknown;
      query: unknown;
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      readonly nothing: "here";
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: unknown;
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormData: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, unknown>) => Promise<{
    hello: string;
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: {
        hello: string;
        search: string;
      };
      iteration: unknown;
      isForm: true;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: string;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: string;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: string;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        hello: zod0.ZodString;
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormDataWithFile: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
    file: zod_v4_core0.File;
  }, {
    search: string;
  }, unknown>) => Promise<{
    hello: string;
    file: string;
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
        file: zod_v4_core0.File;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: {
        hello: string;
        file: string;
        search: string;
      };
      iteration: unknown;
      isForm: true;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: string;
      file: string;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: string;
        file: string;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
          file: zod_v4_core0.File;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: string;
        file: string;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
          file: zod_v4_core0.File;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        hello: zod0.ZodString;
        file: zod0.ZodString;
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
        file: zod0.ZodFile;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormDataWithMultipleFiles: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
    files: zod_v4_core0.File[];
  }, {
    search: string;
  }, unknown>) => Promise<{
    hello: string;
    files: string[];
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
        files: zod_v4_core0.File[];
      };
      query: {
        search: string;
      };
      params: unknown;
      output: {
        hello: string;
        files: string[];
        search: string;
      };
      iteration: unknown;
      isForm: true;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: string;
      files: string[];
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: string;
        files: string[];
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
          files: zod_v4_core0.File[];
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: string;
        files: string[];
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
          files: zod_v4_core0.File[];
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        hello: zod0.ZodString;
        files: zod0.ZodArray<zod0.ZodString>;
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
        files: zod0.ZodArray<zod0.ZodFile>;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  disableServerSideValidationBool: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, unknown>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  disableServerSideValidationStrings: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, unknown>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionBool: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, unknown>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionStrings: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, unknown>) => Promise<{
    body: {
      hello: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  validateEachIteration: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    values: string[];
  }, unknown>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: unknown;
      query: {
        values: string[];
      };
      params: unknown;
      output: unknown;
      iteration: {
        value: string;
      };
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          values: string[];
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          values: string[];
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: zod0.ZodObject<{
        value: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        values: zod0.ZodArray<zod0.ZodString>;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleAllNoHTTP: ClientMethod<(({
    vovk
  }: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, {
    foo: string;
    bar: string;
  }>, params: {
    foo: string;
    bar: string;
  }) => Promise<{
    body: {
      hello: string;
    };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    vovkParams: {
      foo: string;
      bar: string;
    };
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      foo: string;
      bar: string;
    }) => Promise<{
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      vovkParams: {
        foo: string;
        bar: string;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        body: zod0.ZodObject<{
          hello: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        query: zod0.ZodObject<{
          search: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        params: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        vovkParams: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
      }, zod_v4_core0.$strip>;
      params?: zod0.ZodObject<{
        foo: zod0.ZodString;
        bar: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleAllAsFunction: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, {
    foo: string;
    bar: string;
  }>, params: {
    foo: string;
    bar: string;
  }) => Promise<{
    body: {
      hello: string;
    };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    vovkParams: {
      foo: string;
      bar: string;
    };
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      foo: string;
      bar: string;
    }) => Promise<{
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      vovkParams: {
        foo: string;
        bar: string;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        body: zod0.ZodObject<{
          hello: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        query: zod0.ZodObject<{
          search: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        params: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        vovkParams: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
      }, zod_v4_core0.$strip>;
      params?: zod0.ZodObject<{
        foo: zod0.ZodString;
        bar: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleAllNoHttpAsFunction: ClientMethod<((req: vovk0.VovkRequest<{
    hello: string;
  }, {
    search: string;
  }, {
    foo: string;
    bar: string;
  }>, params: {
    foo: string;
    bar: string;
  }) => Promise<{
    body: {
      hello: string;
    };
    query: {
      search: string;
    };
    params: {
      foo: string;
      bar: string;
    };
    vovkParams: {
      foo: string;
      bar: string;
    };
  }>) & {
    __types: {
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      output: {
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      foo: string;
      bar: string;
    }) => Promise<{
      body: {
        hello: string;
      };
      query: {
        search: string;
      };
      params: {
        foo: string;
        bar: string;
      };
      vovkParams: {
        foo: string;
        bar: string;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello: string;
        };
        query: {
          search: string;
        };
        params: {
          foo: string;
          bar: string;
        };
        vovkParams: {
          foo: string;
          bar: string;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello: string;
        };
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: {
          foo: string;
          bar: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        body: zod0.ZodObject<{
          hello: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        query: zod0.ZodObject<{
          search: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        params: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
        vovkParams: zod0.ZodObject<{
          foo: zod0.ZodString;
          bar: zod0.ZodString;
        }, zod_v4_core0.$strip>;
      }, zod_v4_core0.$strip>;
      params?: zod0.ZodObject<{
        foo: zod0.ZodString;
        bar: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        hello: zod0.ZodString;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handlePagination: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    page: string;
    limit: string;
  }, unknown>) => Promise<{
    items: {
      id: number;
      name: string;
    }[];
    hasNextPage: boolean;
    nextPage: number;
  }>) & {
    __types: {
      body: unknown;
      query: {
        page: string;
        limit: string;
      };
      params: unknown;
      output: {
        items: {
          id: number;
          name: string;
        }[];
        hasNextPage: boolean;
        nextPage?: number;
      };
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      items: {
        id: number;
        name: string;
      }[];
      hasNextPage: boolean;
      nextPage: number;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        items: {
          id: number;
          name: string;
        }[];
        hasNextPage: boolean;
        nextPage: number;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          page: string;
          limit: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        items: {
          id: number;
          name: string;
        }[];
        hasNextPage: boolean;
        nextPage: number;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          page: string;
          limit: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: zod0.ZodObject<{
        items: zod0.ZodArray<zod0.ZodObject<{
          id: zod0.ZodNumber;
          name: zod0.ZodString;
        }, zod_v4_core0.$strip>>;
        hasNextPage: zod0.ZodBoolean;
        nextPage: zod0.ZodOptional<zod0.ZodNumber>;
      }, zod_v4_core0.$strip>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        page: zod0.ZodString;
        limit: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const WithYupClientControllerRPC: {
  handleAll: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, {
    foo?: string;
    bar?: string;
  }>, params: {
    foo?: string;
    bar?: string;
  }) => Promise<{
    body: {
      hello?: string;
    };
    query: {
      search?: string;
    };
    params: {
      foo?: string;
      bar?: string;
    };
    vovkParams: {
      foo?: string;
      bar?: string;
    };
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: {
        foo?: string;
        bar?: string;
      };
      output: {
        body?: {
          hello?: string;
        };
        query?: {
          search?: string;
        };
        params?: {
          foo?: string;
          bar?: string;
        };
        vovkParams?: {
          foo?: string;
          bar?: string;
        };
      };
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      foo?: string;
      bar?: string;
    }) => Promise<{
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: {
        foo?: string;
        bar?: string;
      };
      vovkParams: {
        foo?: string;
        bar?: string;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        query: {
          search?: string;
        };
        params: {
          foo?: string;
          bar?: string;
        };
        vovkParams: {
          foo?: string;
          bar?: string;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: {
          foo?: string;
          bar?: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        query: {
          search?: string;
        };
        params: {
          foo?: string;
          bar?: string;
        };
        vovkParams: {
          foo?: string;
          bar?: string;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: {
          foo?: string;
          bar?: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.ObjectSchema<{
        body: {
          hello?: string;
        };
        query: {
          search?: string;
        };
        params: {
          foo?: string;
          bar?: string;
        };
        vovkParams: {
          foo?: string;
          bar?: string;
        };
      }, yup0.AnyObject, {
        body: {
          hello: undefined;
        };
        query: {
          search: undefined;
        };
        params: {
          foo: undefined;
          bar: undefined;
        };
        vovkParams: {
          foo: undefined;
          bar: undefined;
        };
      }, "">;
      params?: yup0.ObjectSchema<{
        foo: string;
        bar: string;
      }, yup0.AnyObject, {
        foo: undefined;
        bar: undefined;
      }, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleQuery: ClientMethod<((req: vovk0.VovkRequest<any, {
    search?: string;
  }, any>) => {
    search?: string;
  }) & {
    __types: {
      body: any;
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      search?: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        search?: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        search?: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleBody: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, any, any>) => Promise<{
    hello?: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello?: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello?: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello?: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.Schema<any, any, any, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleParams: ClientMethod<((req: vovk0.VovkRequest<any, any, {
    foo?: string;
    bar?: string;
  }>) => Promise<{
    foo?: string;
    bar?: string;
  }>) & {
    __types: {
      body: any;
      query: any;
      params: {
        foo?: string;
        bar?: string;
      };
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      foo?: string;
      bar?: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        foo?: string;
        bar?: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: {
          foo?: string;
          bar?: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        foo?: string;
        bar?: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: {
          foo?: string;
          bar?: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.ObjectSchema<{
        foo: string;
        bar: string;
      }, yup0.AnyObject, {
        foo: undefined;
        bar: undefined;
      }, "">;
      query?: yup0.Schema<any, any, any, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNestedQuery: ClientMethod<((req: vovk0.VovkRequest<any, {
    x?: string;
    y?: string[];
    z?: {
      f?: string;
      u?: string[];
      d?: {
        x?: string;
        arrOfObjects?: {
          foo?: string;
          nestedObj?: {
            deepKey?: string;
          };
          nestedArr?: string[];
        }[];
      };
    };
  }, any>) => {
    x?: string;
    y?: string[];
    z?: {
      f?: string;
      u?: string[];
      d?: {
        x?: string;
        arrOfObjects?: {
          foo?: string;
          nestedObj?: {
            deepKey?: string;
          };
          nestedArr?: string[];
        }[];
      };
    };
  }) & {
    __types: {
      body: any;
      query: {
        x?: string;
        y?: string[];
        z?: {
          f?: string;
          u?: string[];
          d?: {
            x?: string;
            arrOfObjects?: {
              foo?: string;
              nestedObj?: {
                deepKey?: string;
              };
              nestedArr?: string[];
            }[];
          };
        };
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      x?: string;
      y?: string[];
      z?: {
        f?: string;
        u?: string[];
        d?: {
          x?: string;
          arrOfObjects?: {
            foo?: string;
            nestedObj?: {
              deepKey?: string;
            };
            nestedArr?: string[];
          }[];
        };
      };
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        x?: string;
        y?: string[];
        z?: {
          f?: string;
          u?: string[];
          d?: {
            x?: string;
            arrOfObjects?: {
              foo?: string;
              nestedObj?: {
                deepKey?: string;
              };
              nestedArr?: string[];
            }[];
          };
        };
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          x?: string;
          y?: string[];
          z?: {
            f?: string;
            u?: string[];
            d?: {
              x?: string;
              arrOfObjects?: {
                foo?: string;
                nestedObj?: {
                  deepKey?: string;
                };
                nestedArr?: string[];
              }[];
            };
          };
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        x?: string;
        y?: string[];
        z?: {
          f?: string;
          u?: string[];
          d?: {
            x?: string;
            arrOfObjects?: {
              foo?: string;
              nestedObj?: {
                deepKey?: string;
              };
              nestedArr?: string[];
            }[];
          };
        };
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          x?: string;
          y?: string[];
          z?: {
            f?: string;
            u?: string[];
            d?: {
              x?: string;
              arrOfObjects?: {
                foo?: string;
                nestedObj?: {
                  deepKey?: string;
                };
                nestedArr?: string[];
              }[];
            };
          };
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        x: string;
        y: string[];
        z: {
          f?: string;
          u?: string[];
          d?: {
            x?: string;
            arrOfObjects?: {
              foo?: string;
              nestedObj?: {
                deepKey?: string;
              };
              nestedArr?: string[];
            }[];
          };
        };
      }, yup0.AnyObject, {
        x: undefined;
        y: "";
        z: {
          f: undefined;
          u: "";
          d: {
            x: undefined;
            arrOfObjects: "";
          };
        };
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleOutput: ClientMethod<((req: vovk0.VovkRequest<any, {
    helloOutput?: string;
  }, any>) => Promise<{
    hello: "world";
  }>) & {
    __types: {
      body: any;
      query: {
        helloOutput?: string;
      };
      params: any;
      output: {
        hello?: string;
      };
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: "world";
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: "world";
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          helloOutput?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: "world";
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          helloOutput?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        helloOutput: string;
      }, yup0.AnyObject, {
        helloOutput: undefined;
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleStream: ClientMethod<((req: vovk0.VovkRequest<any, {
    values?: string[];
  }, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: any;
      query: {
        values?: string[];
      };
      params: any;
      output: any;
      iteration: {
        value?: string;
      };
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          values?: string[];
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          values?: string[];
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.ObjectSchema<{
        value: string;
      }, yup0.AnyObject, {
        value: undefined;
      }, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        values: string[];
      }, yup0.AnyObject, {
        values: "";
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleSchemaConstraints: ClientMethod<((req: vovk0.VovkRequest<{
    enum_value?: string;
    num_minimum?: number;
    num_maximum?: number;
    num_exclusiveMinimum?: number;
    num_exclusiveMaximum?: number;
    num_multipleOf?: number;
    num_int?: number;
    num_int32?: number;
    str_minLength?: string;
    str_maxLength?: string;
    str_pattern?: string;
    str_email?: string;
    str_url?: string;
    str_uuid?: string;
    str_datetime?: string;
    arr_minItems?: string[];
    arr_maxItems?: string[];
    obj_required?: {
      requiredField?: string;
      optionalField?: number;
    };
    obj_strict?: {
      knownField?: string;
    };
    logical_anyOf?: string | number | boolean;
    logical_allOf?: {
      a?: string;
      b?: number;
    };
  }, any, any>) => Promise<{
    enum_value?: string;
    num_minimum?: number;
    num_maximum?: number;
    num_exclusiveMinimum?: number;
    num_exclusiveMaximum?: number;
    num_multipleOf?: number;
    num_int?: number;
    num_int32?: number;
    str_minLength?: string;
    str_maxLength?: string;
    str_pattern?: string;
    str_email?: string;
    str_url?: string;
    str_uuid?: string;
    str_datetime?: string;
    arr_minItems?: string[];
    arr_maxItems?: string[];
    obj_required?: {
      requiredField?: string;
      optionalField?: number;
    };
    obj_strict?: {
      knownField?: string;
    };
    logical_anyOf?: string | number | boolean;
    logical_allOf?: {
      a?: string;
      b?: number;
    };
  }>) & {
    __types: {
      body: {
        enum_value?: string;
        num_minimum?: number;
        num_maximum?: number;
        num_exclusiveMinimum?: number;
        num_exclusiveMaximum?: number;
        num_multipleOf?: number;
        num_int?: number;
        num_int32?: number;
        str_minLength?: string;
        str_maxLength?: string;
        str_pattern?: string;
        str_email?: string;
        str_url?: string;
        str_uuid?: string;
        str_datetime?: string;
        arr_minItems?: string[];
        arr_maxItems?: string[];
        obj_required?: {
          requiredField?: string;
          optionalField?: number;
        };
        obj_strict?: {
          knownField?: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          a?: string;
          b?: number;
        };
      };
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      enum_value?: string;
      num_minimum?: number;
      num_maximum?: number;
      num_exclusiveMinimum?: number;
      num_exclusiveMaximum?: number;
      num_multipleOf?: number;
      num_int?: number;
      num_int32?: number;
      str_minLength?: string;
      str_maxLength?: string;
      str_pattern?: string;
      str_email?: string;
      str_url?: string;
      str_uuid?: string;
      str_datetime?: string;
      arr_minItems?: string[];
      arr_maxItems?: string[];
      obj_required?: {
        requiredField?: string;
        optionalField?: number;
      };
      obj_strict?: {
        knownField?: string;
      };
      logical_anyOf?: string | number | boolean;
      logical_allOf?: {
        a?: string;
        b?: number;
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        enum_value?: string;
        num_minimum?: number;
        num_maximum?: number;
        num_exclusiveMinimum?: number;
        num_exclusiveMaximum?: number;
        num_multipleOf?: number;
        num_int?: number;
        num_int32?: number;
        str_minLength?: string;
        str_maxLength?: string;
        str_pattern?: string;
        str_email?: string;
        str_url?: string;
        str_uuid?: string;
        str_datetime?: string;
        arr_minItems?: string[];
        arr_maxItems?: string[];
        obj_required?: {
          requiredField?: string;
          optionalField?: number;
        };
        obj_strict?: {
          knownField?: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          a?: string;
          b?: number;
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          enum_value?: string;
          num_minimum?: number;
          num_maximum?: number;
          num_exclusiveMinimum?: number;
          num_exclusiveMaximum?: number;
          num_multipleOf?: number;
          num_int?: number;
          num_int32?: number;
          str_minLength?: string;
          str_maxLength?: string;
          str_pattern?: string;
          str_email?: string;
          str_url?: string;
          str_uuid?: string;
          str_datetime?: string;
          arr_minItems?: string[];
          arr_maxItems?: string[];
          obj_required?: {
            requiredField?: string;
            optionalField?: number;
          };
          obj_strict?: {
            knownField?: string;
          };
          logical_anyOf?: string | number | boolean;
          logical_allOf?: {
            a?: string;
            b?: number;
          };
        };
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        enum_value?: string;
        num_minimum?: number;
        num_maximum?: number;
        num_exclusiveMinimum?: number;
        num_exclusiveMaximum?: number;
        num_multipleOf?: number;
        num_int?: number;
        num_int32?: number;
        str_minLength?: string;
        str_maxLength?: string;
        str_pattern?: string;
        str_email?: string;
        str_url?: string;
        str_uuid?: string;
        str_datetime?: string;
        arr_minItems?: string[];
        arr_maxItems?: string[];
        obj_required?: {
          requiredField?: string;
          optionalField?: number;
        };
        obj_strict?: {
          knownField?: string;
        };
        logical_anyOf?: string | number | boolean;
        logical_allOf?: {
          a?: string;
          b?: number;
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          enum_value?: string;
          num_minimum?: number;
          num_maximum?: number;
          num_exclusiveMinimum?: number;
          num_exclusiveMaximum?: number;
          num_multipleOf?: number;
          num_int?: number;
          num_int32?: number;
          str_minLength?: string;
          str_maxLength?: string;
          str_pattern?: string;
          str_email?: string;
          str_url?: string;
          str_uuid?: string;
          str_datetime?: string;
          arr_minItems?: string[];
          arr_maxItems?: string[];
          obj_required?: {
            requiredField?: string;
            optionalField?: number;
          };
          obj_strict?: {
            knownField?: string;
          };
          logical_anyOf?: string | number | boolean;
          logical_allOf?: {
            a?: string;
            b?: number;
          };
        };
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.Schema<any, any, any, "">;
      body?: yup0.ObjectSchema<{
        enum_value: string;
        num_minimum: number;
        num_maximum: number;
        num_exclusiveMinimum: number;
        num_exclusiveMaximum: number;
        num_multipleOf: number;
        num_int: number;
        num_int32: number;
        str_minLength: string;
        str_maxLength: string;
        str_pattern: string;
        str_email: string;
        str_url: string;
        str_uuid: string;
        str_datetime: string;
        arr_minItems: string[];
        arr_maxItems: string[];
        obj_required: {
          requiredField?: string;
          optionalField?: number;
        };
        obj_strict: {
          knownField?: string;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
          a?: string;
          b?: number;
        };
      }, yup0.AnyObject, {
        enum_value: undefined;
        num_minimum: undefined;
        num_maximum: undefined;
        num_exclusiveMinimum: undefined;
        num_exclusiveMaximum: undefined;
        num_multipleOf: undefined;
        num_int: undefined;
        num_int32: undefined;
        str_minLength: undefined;
        str_maxLength: undefined;
        str_pattern: undefined;
        str_email: undefined;
        str_url: undefined;
        str_uuid: undefined;
        str_datetime: undefined;
        arr_minItems: "";
        arr_maxItems: "";
        obj_required: {
          requiredField: undefined;
          optionalField: undefined;
        };
        obj_strict: {
          knownField: undefined;
        };
        logical_anyOf: any;
        logical_allOf: {
          a: undefined;
          b: undefined;
        };
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNothitng: ClientMethod<(() => Promise<{
    readonly nothing: "here";
  }>) & {
    __types: {
      body: any;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      readonly nothing: "here";
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.Schema<any, any, any, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormData: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, any>) => Promise<{
    formData: {
      hello?: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: true;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      formData: {
        hello?: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        formData: {
          hello?: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        formData: {
          hello?: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  disableServerSideValidationBool: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, any>) => Promise<{
    body: {
      hello?: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello?: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  disableServerSideValidationStrings: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, any>) => Promise<{
    body: {
      hello?: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello?: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionBool: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, any>) => Promise<{
    body: {
      hello?: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello?: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionStrings: ClientMethod<((req: vovk0.VovkRequest<{
    hello?: string;
  }, {
    search?: string;
  }, any>) => Promise<{
    body: {
      hello?: string;
    };
    search: string;
  }>) & {
    __types: {
      body: {
        hello?: string;
      };
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: {
        hello?: string;
      };
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: {
          hello?: string;
        };
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          hello?: string;
        };
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        hello: string;
      }, yup0.AnyObject, {
        hello: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  validateEachIteration: ClientMethod<((req: vovk0.VovkRequest<any, {
    values?: string[];
  }, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: any;
      query: {
        values?: string[];
      };
      params: any;
      output: any;
      iteration: {
        value?: string;
      };
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          values?: string[];
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          values?: string[];
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.ObjectSchema<{
        value: string;
      }, yup0.AnyObject, {
        value: undefined;
      }, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        values: string[];
      }, yup0.AnyObject, {
        values: "";
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const WithDtoClientControllerRPC: {
  handleAll: ClientMethod<((req: vovk0.VovkRequest<HandleAllBodyDto, HandleAllQueryDto, HandleAllParamsDto>, params: HandleAllParamsDto) => Promise<{
    body: HandleAllBodyDto;
    query: HandleAllQueryDto;
    params: HandleAllParamsDto;
    vovkParams: HandleAllParamsDto;
  }>) & {
    __types: {
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      output: HandleAllOutputDto;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: HandleAllParamsDto) => Promise<{
      body: HandleAllBodyDto;
      query: HandleAllQueryDto;
      params: HandleAllParamsDto;
      vovkParams: HandleAllParamsDto;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: HandleAllBodyDto;
        query: HandleAllQueryDto;
        params: HandleAllParamsDto;
        vovkParams: HandleAllParamsDto;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleAllBodyDto;
      } & {
        query?: HandleAllQueryDto;
      } & {
        params?: HandleAllParamsDto;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: HandleAllBodyDto;
        query: HandleAllQueryDto;
        params: HandleAllParamsDto;
        vovkParams: HandleAllParamsDto;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleAllBodyDto;
      } & {
        query?: HandleAllQueryDto;
      } & {
        params?: HandleAllParamsDto;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: typeof HandleAllOutputDto;
      params?: typeof HandleAllParamsDto;
      query?: typeof HandleAllQueryDto;
      body?: typeof HandleAllBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNestedQuery: ClientMethod<((req: vovk0.VovkRequest<any, HandleNestedQueryDto, any>) => HandleNestedQueryDto) & {
    __types: {
      body: any;
      query: HandleNestedQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => HandleNestedQueryDto;
  } & {
    fn: {
      <RETURN_TYPE = HandleNestedQueryDto>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleNestedQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = HandleNestedQueryDto>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleNestedQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleNestedQueryDto;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNestedQueryClient: (req: vovk0.VovkRequest<unknown, HandleNestedQueryDto>) => Promise<HandleNestedQueryDto>;
  handleOutput: ClientMethod<((req: vovk0.VovkRequest<any, HandleOutputQueryDto, any>) => Promise<{
    hello: "world";
  }>) & {
    __types: {
      body: any;
      query: HandleOutputQueryDto;
      params: any;
      output: HandleOutputOutputDto;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      hello: "world";
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        hello: "world";
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleOutputQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        hello: "world";
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleOutputQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: typeof HandleOutputOutputDto;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleOutputQueryDto;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleOutputClient: (req: vovk0.VovkRequest<never, HandleOutputQueryDto>) => Promise<{
    hello: "world";
  }>;
  handleStream: ClientMethod<((req: vovk0.VovkRequest<any, HandleStreamQueryDto, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: any;
      query: HandleStreamQueryDto;
      params: any;
      output: any;
      iteration: IterationDto;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleStreamQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleStreamQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: typeof IterationDto;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleStreamQueryDto;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleSchemaConstraints: ClientMethod<((req: vovk0.VovkRequest<ConstrainingDto, any, any>) => Promise<ConstrainingDto>) & {
    __types: {
      body: ConstrainingDto;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<ConstrainingDto>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<ConstrainingDto>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: ConstrainingDto;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<ConstrainingDto>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: ConstrainingDto;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: class_transformer0.ClassConstructor<any>;
      body?: typeof ConstrainingDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleNothitng: ClientMethod<(() => Promise<{
    readonly nothing: "here";
  }>) & {
    __types: {
      body: any;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      readonly nothing: "here";
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        readonly nothing: "here";
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: class_transformer0.ClassConstructor<any>;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormData: ClientMethod<((req: vovk0.VovkRequest<HandleAllBodyDto, HandleQueryQueryDto, any>) => Promise<{
    formData: HandleAllBodyDto;
    search: string;
  }>) & {
    __types: {
      body: HandleAllBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: true;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      formData: HandleAllBodyDto;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        formData: HandleAllBodyDto;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleAllBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        formData: HandleAllBodyDto;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleAllBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: typeof HandleAllBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleFormDataClient: (req: vovk0.VovkRequest<unknown, HandleQueryQueryDto>) => Promise<{
    formData: HandleAllBodyDto;
    search: string;
  }>;
  disableServerSideValidationBool: ClientMethod<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: HandleBodyBodyDto;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: typeof HandleBodyBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  disableServerSideValidationStrings: ClientMethod<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: HandleBodyBodyDto;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: typeof HandleBodyBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionBool: ClientMethod<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: HandleBodyBodyDto;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: typeof HandleBodyBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  skipSchemaEmissionStrings: ClientMethod<((req: vovk0.VovkRequest<HandleBodyBodyDto, HandleQueryQueryDto, any>) => Promise<{
    body: HandleBodyBodyDto;
    search: string;
  }>) & {
    __types: {
      body: HandleBodyBodyDto;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<{
      body: HandleBodyBodyDto;
      search: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        body: HandleBodyBodyDto;
        search: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: typeof HandleBodyBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  validateEachIteration: ClientMethod<((req: vovk0.VovkRequest<any, QueryValuesDto, any>) => AsyncGenerator<{
    value: string;
  }, void, unknown>) & {
    __types: {
      body: any;
      query: QueryValuesDto;
      params: any;
      output: any;
      iteration: IterationDto;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => AsyncGenerator<{
      value: string;
    }, void, unknown>;
  } & {
    fn: {
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: QueryValuesDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = AsyncGenerator<{
        value: string;
      }, void, unknown>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: QueryValuesDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: typeof IterationDto;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof QueryValuesDto;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleAllClient: (req: vovk0.VovkRequest<HandleAllBodyDto, HandleAllQueryDto>, params: HandleAllParamsDto) => Promise<HandleAllOutputDto>;
  handleQuery: ClientMethod<((req: vovk0.VovkRequest<any, HandleQueryQueryDto, any>) => HandleQueryQueryDto) & {
    __types: {
      body: any;
      query: HandleQueryQueryDto;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => HandleQueryQueryDto;
  } & {
    fn: {
      <RETURN_TYPE = HandleQueryQueryDto>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = HandleQueryQueryDto>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: HandleQueryQueryDto;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: typeof HandleQueryQueryDto;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleQueryClient: (req: vovk0.VovkRequest<unknown, HandleQueryQueryDto>) => Promise<HandleQueryQueryDto>;
  handleBody: ClientMethod<((req: vovk0.VovkRequest<HandleBodyBodyDto, any, any>) => Promise<HandleBodyBodyDto>) & {
    __types: {
      body: HandleBodyBodyDto;
      query: any;
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<HandleBodyBodyDto>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<HandleBodyBodyDto>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<HandleBodyBodyDto>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: HandleBodyBodyDto;
      } & {
        query?: any;
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: class_transformer0.ClassConstructor<any>;
      body?: typeof HandleBodyBodyDto;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleBodyClient: (req: vovk0.VovkRequest<HandleBodyBodyDto>) => Promise<HandleBodyBodyDto>;
  handleParams: ClientMethod<((req: vovk0.VovkRequest<any, any, HandleParamsDto>) => Promise<HandleParamsDto>) & {
    __types: {
      body: any;
      query: any;
      params: HandleParamsDto;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => Promise<HandleParamsDto>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<HandleParamsDto>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: HandleParamsDto;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<HandleParamsDto>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: any;
      } & {
        params?: HandleParamsDto;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: typeof HandleParamsDto;
      query?: class_transformer0.ClassConstructor<any>;
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  handleParamsClient: (_req: vovk0.VovkRequest, params: HandleParamsDto) => Promise<HandleParamsDto>;
};
declare const OpenApiControllerRPC: {
  getFromSchema: ClientMethod<typeof OpenApiController.getFromSchema, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
};
declare const NoValidationControllerOnlyEntityRPC: {
  getNoValidationControllerOnlyEntities: (req: vovk0.VovkRequest<null, {
    search: string;
  }>) => Promise<{
    results: any[];
    search: string;
  }>;
  updateNoValidationControllerOnlyEntity: (req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    body: {
      foo: "bar" | "baz";
    };
    q: string;
  }>;
  createNoValidationControllerOnlyEntity: () => void;
  deleteNoValidationControllerOnlyEntity: () => void;
};
declare const NoValidationControllerAndServiceEntityRPC: {
  getNoValidationControllerAndServiceEntities: (req: vovk0.VovkRequest<null, {
    search: string;
  }>) => Promise<{
    results: any[];
    search: string;
  }>;
  updateNoValidationControllerAndServiceEntity: (req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    q: string;
    body: {
      foo: "bar" | "baz";
    };
  }>;
  createNoValidationControllerAndServiceEntity: () => void;
  deleteNoValidationControllerAndServiceEntity: () => void;
};
declare const ZodControllerOnlyEntityRPC: {
  getZodControllerOnlyEntities: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    search: string;
  }, unknown>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateZodControllerOnlyEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo?: "bar" | "baz";
  }, {
    q: string;
  }, {
    id: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    body: {
      foo?: "bar" | "baz";
    };
    q: string;
  }>) & {
    __types: {
      body: {
        foo?: "bar" | "baz";
      };
      query: {
        q: string;
      };
      params: {
        id: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      body: {
        foo?: "bar" | "baz";
      };
      q: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo?: "bar" | "baz";
        };
        q: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: {
          id: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo?: "bar" | "baz";
        };
        q: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: {
          id: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: zod0.ZodObject<{
        id: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        q: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        foo: zod0.ZodUnion<readonly [zod0.ZodLiteral<"bar">, zod0.ZodLiteral<"baz">]>;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createZodControllerOnlyEntity: () => void;
  deleteZodControllerOnlyEntity: () => void;
};
declare const ZodControllerAndServiceEntityRPC: {
  getZodControllerAndServiceEntities: ClientMethod<((req: vovk0.VovkRequest<unknown, {
    search: string;
  }, unknown>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: unknown;
      query: {
        search: string;
      };
      params: unknown;
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: unknown;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: unknown;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      query?: zod0.ZodObject<{
        search: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateZodControllerAndServiceEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo?: "bar" | "baz";
  }, {
    q: string;
  }, {
    id: string;
  }>, params: {
    id: string;
  }) => Promise<{
    id: string;
    q: string;
    body: {
      foo?: "bar" | "baz";
    };
  }>) & {
    __types: {
      body: {
        foo?: "bar" | "baz";
      };
      query: {
        q: string;
      };
      params: {
        id: string;
      };
      output: unknown;
      iteration: unknown;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      q: string;
      body: {
        foo?: "bar" | "baz";
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo?: "bar" | "baz";
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: {
          id: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo?: "bar" | "baz";
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: {
          id: string;
        };
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      output?: _standard_schema_spec0.StandardSchemaV1<unknown, unknown>;
      params?: zod0.ZodObject<{
        id: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      query?: zod0.ZodObject<{
        q: zod0.ZodString;
      }, zod_v4_core0.$strip>;
      body?: zod0.ZodObject<{
        foo: zod0.ZodUnion<readonly [zod0.ZodLiteral<"bar">, zod0.ZodLiteral<"baz">]>;
      }, zod_v4_core0.$strip>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createZodControllerAndServiceEntity: () => void;
  deleteZodControllerAndServiceEntity: () => void;
};
declare const YupControllerOnlyEntityRPC: {
  getYupControllerOnlyEntities: ClientMethod<((req: vovk0.VovkRequest<any, {
    search?: string;
  }, any>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: any;
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateYupControllerOnlyEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo?: {};
  }, {
    q?: string;
  }, any>, params: {
    id: string;
  }) => Promise<{
    id: string;
    body: {
      foo?: {};
    };
    q: string;
  }>) & {
    __types: {
      body: {
        foo?: {};
      };
      query: {
        q?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      body: {
        foo?: {};
      };
      q: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo?: {};
        };
        q: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: {};
        };
      } & {
        query?: {
          q?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo?: {};
        };
        q: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: {};
        };
      } & {
        query?: {
          q?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        q: string;
      }, yup0.AnyObject, {
        q: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        foo: {};
      }, yup0.AnyObject, {
        foo: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createYupControllerOnlyEntity: () => void;
  deleteYupControllerOnlyEntity: () => void;
};
declare const YupControllerAndServiceEntityRPC: {
  getYupControllerAndServiceEntities: ClientMethod<((req: vovk0.VovkRequest<any, {
    search?: string;
  }, any>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: any;
      query: {
        search?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        search: string;
      }, yup0.AnyObject, {
        search: undefined;
      }, "">;
      body?: yup0.Schema<any, any, any, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateYupControllerAndServiceEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo?: {};
  }, {
    q?: string;
  }, any>, params: {
    id: string;
  }) => Promise<{
    id: string;
    q: string;
    body: {
      foo?: {};
    };
  }>) & {
    __types: {
      body: {
        foo?: {};
      };
      query: {
        q?: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      q: string;
      body: {
        foo?: {};
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo?: {};
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: {};
        };
      } & {
        query?: {
          q?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo?: {};
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo?: {};
        };
      } & {
        query?: {
          q?: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: yup0.Schema<any, any, any, "">;
      output?: yup0.Schema<any, any, any, "">;
      params?: yup0.Schema<any, any, any, "">;
      query?: yup0.ObjectSchema<{
        q: string;
      }, yup0.AnyObject, {
        q: undefined;
      }, "">;
      body?: yup0.ObjectSchema<{
        foo: {};
      }, yup0.AnyObject, {
        foo: undefined;
      }, "">;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createYupControllerAndServiceEntity: () => void;
  deleteYupControllerAndServiceEntity: () => void;
};
declare const DtoControllerOnlyEntityRPC: {
  getDtoControllerOnlyEntities: ClientMethod<((req: vovk0.VovkRequest<any, {
    search: string;
  }, any>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: any;
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: {
        new (): {
          search: string;
        };
      };
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateDtoControllerOnlyEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }, any>, params: {
    id: string;
  }) => Promise<{
    id: string;
    body: {
      foo: "bar" | "baz";
    };
    q: string;
  }>) & {
    __types: {
      body: {
        foo: "bar" | "baz";
      };
      query: {
        q: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      body: {
        foo: "bar" | "baz";
      };
      q: string;
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo: "bar" | "baz";
        };
        q: string;
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        body: {
          foo: "bar" | "baz";
        };
        q: string;
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: {
        new (): {
          q: string;
        };
      };
      body?: {
        new (): {
          foo: "bar" | "baz";
        };
      };
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createDtoControllerOnlyEntity: () => void;
  deleteDtoControllerOnlyEntity: () => void;
};
declare const DtoControllerAndServiceEntityRPC: {
  getDtoControllerAndServiceEntities: ClientMethod<((req: vovk0.VovkRequest<any, {
    search: string;
  }, any>) => {
    results: any[];
    search: string;
  }) & {
    __types: {
      body: any;
      query: {
        search: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: undefined) => {
      results: any[];
      search: string;
    };
  } & {
    fn: {
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = {
        results: any[];
        search: string;
      }>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: any;
      } & {
        query?: {
          search: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: {
        new (): {
          search: string;
        };
      };
      body?: class_transformer0.ClassConstructor<any>;
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  updateDtoControllerAndServiceEntity: ClientMethod<((req: vovk0.VovkRequest<{
    foo: "bar" | "baz";
  }, {
    q: string;
  }, any>, params: {
    id: string;
  }) => Promise<{
    id: string;
    q: string;
    body: {
      foo: "bar" | "baz";
    };
  }>) & {
    __types: {
      body: {
        foo: "bar" | "baz";
      };
      query: {
        q: string;
      };
      params: any;
      output: any;
      iteration: any;
      isForm: false;
    };
    isRPC?: boolean;
  } & {
    schema: vovk0.VovkHandlerSchema;
    wrapper?: (req: vovk0.VovkRequest<any, any, any>, params: {
      id: string;
    }) => Promise<{
      id: string;
      q: string;
      body: {
        foo: "bar" | "baz";
      };
    }>;
  } & {
    fn: {
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo: "bar" | "baz";
        };
      }>>(input?: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
      <RETURN_TYPE = Promise<{
        id: string;
        q: string;
        body: {
          foo: "bar" | "baz";
        };
      }>>(input: {
        disableClientValidation?: boolean;
      } & {
        body?: {
          foo: "bar" | "baz";
        };
      } & {
        query?: {
          q: string;
        };
      } & {
        params?: any;
      } & {
        meta?: {
          [key: string]: any;
          __disableClientValidation?: boolean;
        };
      }): RETURN_TYPE;
    };
    models: {
      iteration?: class_transformer0.ClassConstructor<any>;
      output?: class_transformer0.ClassConstructor<any>;
      params?: class_transformer0.ClassConstructor<any>;
      query?: {
        new (): {
          q: string;
        };
      };
      body?: {
        new (): {
          foo: "bar" | "baz";
        };
      };
    };
  }, {
    apiRoot?: string;
    disableClientValidation?: boolean;
    validateOnClient?: vovk0.VovkValidateOnClient<unknown> | undefined;
    interpretAs?: string;
    init?: RequestInit;
  }, unknown>;
  createDtoControllerAndServiceEntity: () => void;
  deleteDtoControllerAndServiceEntity: () => void;
};
declare const ValibotControllerOnlyEntityRPC: {
  [x: string]: any;
  createValibotControllerOnlyEntity: () => void;
  deleteValibotControllerOnlyEntity: () => void;
};
declare const ValibotControllerAndServiceEntityRPC: {
  [x: string]: any;
  createValibotControllerAndServiceEntity: () => void;
  deleteValibotControllerAndServiceEntity: () => void;
};
declare const ArktypeControllerOnlyEntityRPC: {
  [x: string]: any;
  createArktypeControllerOnlyEntity: () => void;
  deleteArktypeControllerOnlyEntity: () => void;
};
declare const ArktypeControllerAndServiceEntityRPC: {
  [x: string]: any;
  createArktypeControllerAndServiceEntity: () => void;
  deleteArktypeControllerAndServiceEntity: () => void;
};
//#endregion
export { ArktypeControllerAndServiceEntityRPC, ArktypeControllerOnlyEntityRPC, CommonControllerRPC, CustomSchemaControllerRPC, DtoControllerAndServiceEntityRPC, DtoControllerOnlyEntityRPC, NoValidationControllerAndServiceEntityRPC, NoValidationControllerOnlyEntityRPC, OpenApiControllerRPC, StreamingControllerRPC, StreamingGeneratorControllerRPC, ValibotControllerAndServiceEntityRPC, ValibotControllerOnlyEntityRPC, WithDtoClientControllerRPC, WithYupClientControllerRPC, WithZodClientControllerRPC, YupControllerAndServiceEntityRPC, YupControllerOnlyEntityRPC, ZodControllerAndServiceEntityRPC, ZodControllerOnlyEntityRPC, schema$1 as schema };
//# sourceMappingURL=index.d.cts.map