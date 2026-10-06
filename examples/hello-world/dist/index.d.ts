//#region ../../node_modules/openapi3-ts/dist/model/specification-extension.d.ts
type IExtensionName = `x-${string}`;
type IExtensionType = any;
type ISpecificationExtension = {
  [extensionName: IExtensionName]: IExtensionType;
};
//#endregion
//#region ../../node_modules/openapi3-ts/dist/model/oas-common.d.ts
interface ServerObject extends ISpecificationExtension {
  url: string;
  description?: string;
  variables?: {
    [v: string]: ServerVariableObject;
  };
}
interface ServerVariableObject extends ISpecificationExtension {
  enum?: string[] | boolean[] | number[];
  default: string | boolean | number;
  description?: string;
}
//#endregion
//#region ../../node_modules/openapi3-ts/dist/model/openapi31.d.ts
interface OpenAPIObject extends ISpecificationExtension {
  openapi: string;
  info: InfoObject;
  servers?: ServerObject[];
  paths?: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  webhooks?: PathsObject;
}
interface InfoObject extends ISpecificationExtension {
  title: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
}
interface ContactObject extends ISpecificationExtension {
  name?: string;
  url?: string;
  email?: string;
}
interface LicenseObject extends ISpecificationExtension {
  name: string;
  identifier?: string;
  url?: string;
}
interface ComponentsObject extends ISpecificationExtension {
  schemas?: {
    [schema: string]: SchemaObject | ReferenceObject;
  };
  responses?: {
    [response: string]: ResponseObject | ReferenceObject;
  };
  parameters?: {
    [parameter: string]: ParameterObject | ReferenceObject;
  };
  examples?: {
    [example: string]: ExampleObject | ReferenceObject;
  };
  requestBodies?: {
    [request: string]: RequestBodyObject | ReferenceObject;
  };
  headers?: {
    [header: string]: HeaderObject | ReferenceObject;
  };
  securitySchemes?: {
    [securityScheme: string]: SecuritySchemeObject | ReferenceObject;
  };
  links?: {
    [link: string]: LinkObject | ReferenceObject;
  };
  callbacks?: {
    [callback: string]: CallbackObject | ReferenceObject;
  };
  pathItems?: {
    [pathItem: string]: PathItemObject | ReferenceObject;
  };
}
interface PathsObject extends ISpecificationExtension {
  [path: string]: PathItemObject;
}
interface PathItemObject extends ISpecificationExtension {
  $ref?: string;
  summary?: string;
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: (ParameterObject | ReferenceObject)[];
}
interface OperationObject extends ISpecificationExtension {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: (ParameterObject | ReferenceObject)[];
  requestBody?: RequestBodyObject | ReferenceObject;
  responses?: ResponsesObject;
  callbacks?: CallbacksObject;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
}
interface ExternalDocumentationObject extends ISpecificationExtension {
  description?: string;
  url: string;
}
type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';
type ParameterStyle = 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
interface BaseParameterObject extends ISpecificationExtension {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: SchemaObject | ReferenceObject;
  examples?: {
    [param: string]: ExampleObject | ReferenceObject;
  };
  example?: any;
  content?: ContentObject;
}
interface ParameterObject extends BaseParameterObject {
  name: string;
  in: ParameterLocation;
}
interface RequestBodyObject extends ISpecificationExtension {
  description?: string;
  content: ContentObject;
  required?: boolean;
}
interface ContentObject {
  [mediatype: string]: MediaTypeObject;
}
interface MediaTypeObject extends ISpecificationExtension {
  schema?: SchemaObject | ReferenceObject;
  examples?: ExamplesObject;
  example?: any;
  encoding?: EncodingObject;
}
interface EncodingObject extends ISpecificationExtension {
  [property: string]: EncodingPropertyObject | any;
}
interface EncodingPropertyObject {
  contentType?: string;
  headers?: {
    [key: string]: HeaderObject | ReferenceObject;
  };
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  [key: string]: any;
}
interface ResponsesObject extends ISpecificationExtension {
  default?: ResponseObject | ReferenceObject;
  [statuscode: string]: ResponseObject | ReferenceObject | any;
}
interface ResponseObject extends ISpecificationExtension {
  description: string;
  headers?: HeadersObject;
  content?: ContentObject;
  links?: LinksObject;
}
interface CallbacksObject extends ISpecificationExtension {
  [name: string]: CallbackObject | ReferenceObject | any;
}
interface CallbackObject extends ISpecificationExtension {
  [name: string]: PathItemObject | any;
}
interface HeadersObject {
  [name: string]: HeaderObject | ReferenceObject;
}
interface ExampleObject {
  summary?: string;
  description?: string;
  value?: any;
  externalValue?: string;
  [property: string]: any;
}
interface LinksObject {
  [name: string]: LinkObject | ReferenceObject;
}
interface LinkObject extends ISpecificationExtension {
  operationRef?: string;
  operationId?: string;
  parameters?: LinkParametersObject;
  requestBody?: any | string;
  description?: string;
  server?: ServerObject;
  [property: string]: any;
}
interface LinkParametersObject {
  [name: string]: any | string;
}
interface HeaderObject extends BaseParameterObject {
  $ref?: string;
}
interface TagObject extends ISpecificationExtension {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
  [extension: string]: any;
}
interface ExamplesObject {
  [name: string]: ExampleObject | ReferenceObject;
}
interface ReferenceObject {
  $ref: string;
  summary?: string;
  description?: string;
}
type SchemaObjectType = 'integer' | 'number' | 'string' | 'boolean' | 'object' | 'null' | 'array';
interface SchemaObject extends ISpecificationExtension {
  $ref?: string;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XmlObject;
  externalDocs?: ExternalDocumentationObject;
  example?: any;
  examples?: any[];
  deprecated?: boolean;
  type?: SchemaObjectType | SchemaObjectType[];
  format?: 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'binary' | 'date' | 'date-time' | 'password' | string;
  allOf?: (SchemaObject | ReferenceObject)[];
  oneOf?: (SchemaObject | ReferenceObject)[];
  anyOf?: (SchemaObject | ReferenceObject)[];
  not?: SchemaObject | ReferenceObject;
  items?: SchemaObject | ReferenceObject;
  properties?: {
    [propertyName: string]: SchemaObject | ReferenceObject;
  };
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  propertyNames?: SchemaObject | ReferenceObject;
  description?: string;
  default?: any;
  title?: string;
  multipleOf?: number;
  maximum?: number;
  const?: any;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  prefixItems?: (SchemaObject | ReferenceObject)[];
  contentMediaType?: string;
  contentEncoding?: string;
}
interface DiscriminatorObject {
  propertyName: string;
  mapping?: {
    [key: string]: string;
  };
}
interface XmlObject extends ISpecificationExtension {
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
}
type SecuritySchemeType = 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
interface SecuritySchemeObject extends ISpecificationExtension {
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}
interface OAuthFlowsObject extends ISpecificationExtension {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}
interface OAuthFlowObject extends ISpecificationExtension {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: ScopesObject;
}
interface ScopesObject extends ISpecificationExtension {
  [scope: string]: any;
}
interface SecurityRequirementObject {
  [name: string]: string[];
}
//#endregion
//#region ../../packages/vovk/dist/core/json-lines-responder.d.ts
declare abstract class Responder {
  response: Response;
}
/**
 * Responder subclass for streaming JSON Lines. @see https://vovk.dev/jsonlines
 * @example
 * ```ts
 * import { JSONLinesResponder } from 'vovk';
 *
 * const responder = new JSONLinesResponder<MyItemType>(request, (responder) => {
 *   return new Response(responder.readableStream, { headers: responder.headers });
 * });
 *
 * responder.send({ ... }); // send items
 * responder.close(); // close the stream when done
 * responder.throw(new Error('Something went wrong'));
 * const { response, headers } = responder;
 * ```
 */
declare class JSONLinesResponder<T> extends Responder {
  private closing;
  private closed;
  private i;
  private queue;
  private hasSent;
  private resumeSend;
  private controller?;
  private readonly encoder;
  readonly readableStream: ReadableStream | null;
  readonly headers: Record<string, string>;
  onBeforeSend: (item: T, i: number) => T | Promise<T>;
  _onError?: (error: unknown) => void;
  constructor(request?: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response);
  /** Whether the stream is closed: by close() or throw(), or because the client went away. Later lines are dropped. */
  get isClosed(): boolean;
  readonly send: (item: T) => Promise<void>;
  /** Writes a line as it is, after the queued ones. */
  sendLineOrError: (data: T | StreamAbortMessage) => void;
  readonly close: () => Promise<void>;
  readonly throw: (e: unknown) => Promise<void>;
  private enqueue;
  private writeLine;
  private toErrorLine;
  private end;
  private waitForRoom;
  private queuedBytes;
  private resume;
  private stop;
  private readonly abort;
}
//#endregion
//#region ../../packages/vovk/dist/types/enums.d.ts
/**
 * HTTP methods enum
 */
declare enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS"
}
/**
 * HTTP status codes enum
 */
declare enum HttpStatus {
  NULL = 0,
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  EARLYHINTS = 103,
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  MISDIRECTED = 421,
  UNPROCESSABLE_ENTITY = 422,
  FAILED_DEPENDENCY = 424,
  PRECONDITION_REQUIRED = 428,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505
}
/**
 * IDs of the JSON Schema files that can be generated by Vovk.ts
 */
declare enum VovkSchemaIdEnum {
  META = "https://vovk.dev/api/schema/v3/meta.json",
  CONFIG = "https://vovk.dev/api/schema/v3/config.json",
  SEGMENT = "https://vovk.dev/api/schema/v3/segment.json",
  SCHEMA = "https://vovk.dev/api/schema/v3/schema.json"
}
//#endregion
//#region ../../packages/vovk/dist/types/utils.d.ts
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type IsEmptyObject<T> = T extends object ? keyof T extends never ? true : T extends Partial<T> ? Partial<T> extends T ? true : false : false : false;
type Prettify$1<T> = { [K in keyof T]: T[K]; } & {};
type KnownAny = any;
type StaticClass = Function;
type IsAny$1<T> = 0 extends 1 & T ? true : false;
type VovkNoInference<T> = [T][T extends unknown ? 0 : never];
//#endregion
//#region ../../packages/vovk/dist/types/request.d.ts
/**
 * Represents a cookie object
 */
type VovkRequestCookie = {
  name: string;
  value: string;
  [key: string]: string;
};
type RawSearchParamValue<T> = T extends string ? T : string;
type SearchParamItem<T> = T extends readonly (infer ITEM)[] ? ITEM : T;
type RawQuery<TQueryInput, TQuery> = unknown extends TQueryInput ? TQuery : TQueryInput;
type SearchParamValue<T, KEY extends keyof T> = {} extends Pick<T, KEY> ? RawSearchParamValue<Exclude<T[KEY], undefined>> | null : unknown extends T[KEY] ? string : undefined extends T[KEY] ? RawSearchParamValue<Exclude<T[KEY], undefined>> | null : T[KEY] extends object ? string | null : RawSearchParamValue<T[KEY]>;
type IsQueryTyped<T> = IsAny$1<T> extends true ? true : unknown extends T ? false : [T] extends [null | undefined] ? false : true;
type SearchParamKey<T> = IsQueryTyped<T> extends true ? keyof T & string : string;
type SearchParams<T> = {
  get: <KEY extends SearchParamKey<T>>(key: KEY) => IsQueryTyped<T> extends true ? SearchParamValue<T, KEY & keyof T> : string | null;
  getAll: <KEY extends SearchParamKey<T>>(key: KEY) => IsQueryTyped<T> extends true ? RawSearchParamValue<SearchParamItem<T[KEY & keyof T]>>[] : string[];
  has: <KEY extends SearchParamKey<T>>(key: KEY, value?: string) => boolean;
  entries: () => IterableIterator<[string, string]>;
  forEach: (callbackfn: (value: string, key: string) => void) => void;
  keys: () => IterableIterator<string>;
  values: () => IterableIterator<string>;
};
/**
 * The Vovk.ts request object extending Next.js's NextRequest, generics: TBody, TQuery, TParams.
 * TBodyInput and TQueryInput are what the client sent, before a schema's defaults and transforms.
 * @see https://vovk.dev/procedure
 */
interface VovkRequest<TBody = unknown, TQuery = unknown, TParams = unknown, TBodyInput = TBody, TQueryInput = TQuery> extends Request {
  json: () => Promise<TBodyInput>;
  cookies: {
    set: (name: string, value: string) => void;
    get: (name: string) => VovkRequestCookie | undefined;
    getAll: (name?: string) => VovkRequestCookie[];
    delete: (name: string) => boolean;
    has: (name: string) => boolean;
    clear: () => void;
  };
  nextUrl: {
    basePath: string;
    buildId: string | undefined;
    pathname: string;
    search: string;
    searchParams: SearchParams<RawQuery<TQueryInput, TQuery>>;
  };
  vovk: {
    body: () => Promise<TBody>;
    query: () => TQuery;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    params: () => TParams;
  };
}
//#endregion
//#region ../../packages/vovk/dist/types/standard-schema.d.ts
/** The Standard Typed interface. This is a base type extended by other specs. */
interface StandardTypedV1$1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly '~standard': StandardTypedV1$1.Props<Input, Output>;
}
declare namespace StandardTypedV1$1 {
  /** The Standard Typed properties interface. */
  interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }
  /** The Standard Typed types interface. */
  interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }
  /** Infers the input type of a Standard Typed. */
  type InferInput<Schema extends StandardTypedV1$1> = NonNullable<Schema['~standard']['types']>['input'];
  /** Infers the output type of a Standard Typed. */
  type InferOutput<Schema extends StandardTypedV1$1> = NonNullable<Schema['~standard']['types']>['output'];
}
/** The Standard Schema interface. */
interface StandardSchemaV1$1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly '~standard': StandardSchemaV1$1.Props<Input, Output>;
}
declare namespace StandardSchemaV1$1 {
  /** The Standard Schema properties interface. */
  interface Props<Input = unknown, Output = Input> extends StandardTypedV1$1.Props<Input, Output> {
    /** Validates unknown input values. */
    readonly validate: (value: unknown, options?: StandardSchemaV1$1.Options | undefined) => Result<Output> | Promise<Result<Output>>;
  }
  /** The result interface of the validate function. */
  type Result<Output> = SuccessResult<Output> | FailureResult;
  /** The result interface if validation succeeds. */
  interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** A falsy value for `issues` indicates success. */
    readonly issues?: undefined;
  }
  interface Options {
    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }
  /** The result interface if validation fails. */
  interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }
  /** The issue interface of the failure output. */
  interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  /** The path segment interface of the issue. */
  interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }
  /** The Standard types interface. */
  interface Types<Input = unknown, Output = Input> extends StandardTypedV1$1.Types<Input, Output> {}
  /** Infers the input type of a Standard. */
  type InferInput<Schema extends StandardTypedV1$1> = StandardTypedV1$1.InferInput<Schema>;
  /** Infers the output type of a Standard. */
  type InferOutput<Schema extends StandardTypedV1$1> = StandardTypedV1$1.InferOutput<Schema>;
}
/** The Standard JSON Schema interface. */
interface StandardJSONSchemaV1$1<Input = unknown, Output = Input> {
  /** The Standard JSON Schema properties. */
  readonly '~standard': StandardJSONSchemaV1$1.Props<Input, Output>;
}
declare namespace StandardJSONSchemaV1$1 {
  /** The Standard JSON Schema properties interface. */
  interface Props<Input = unknown, Output = Input> extends StandardTypedV1$1.Props<Input, Output> {
    /** Methods for generating the input/output JSON Schema. */
    readonly jsonSchema: StandardJSONSchemaV1$1.Converter;
  }
  /** The Standard JSON Schema converter interface. */
  interface Converter {
    /** Converts the input type to JSON Schema. May throw if conversion is not supported. */
    readonly input: (options: StandardJSONSchemaV1$1.Options) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. May throw if conversion is not supported. */
    readonly output: (options: StandardJSONSchemaV1$1.Options) => Record<string, unknown>;
  }
  /**
   * The target version of the generated JSON Schema.
   *
   * It is *strongly recommended* that implementers support `"draft-2020-12"` and `"draft-07"`, as they are both in wide use. All other targets can be implemented on a best-effort basis. Libraries should throw if they don't support a specified target.
   *
   * The `"openapi-3.0"` target is intended as a standardized specifier for OpenAPI 3.0 which is a superset of JSON Schema `"draft-04"`.
   */
  type Target = 'draft-2020-12' | 'draft-07' | 'openapi-3.0' | ({} & string);
  /** The options for the input/output methods. */
  interface Options {
    /** Specifies the target version of the generated JSON Schema. Support for all versions is on a best-effort basis. If a given version is not supported, the library should throw. */
    readonly target: Target;
    /** Explicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }
  /** The Standard types interface. */
  interface Types<Input = unknown, Output = Input> extends StandardTypedV1$1.Types<Input, Output> {}
  /** Infers the input type of a Standard. */
  type InferInput<Schema extends StandardTypedV1$1> = StandardTypedV1$1.InferInput<Schema>;
  /** Infers the output type of a Standard. */
  type InferOutput<Schema extends StandardTypedV1$1> = StandardTypedV1$1.InferOutput<Schema>;
}
//#endregion
//#region ../../packages/vovk/dist/types/tools.d.ts
type VovkToolOptions = {
  hidden?: boolean;
  name?: string;
  title?: string;
  description?: string;
  meta?: Record<string, unknown>;
};
//#endregion
//#region ../../packages/vovk/dist/types/operation.d.ts
type VovkOperationObject = OperationObject & {
  'x-tool'?: VovkToolOptions;
};
//#endregion
//#region ../../packages/vovk/dist/types/package.d.ts
type Primitive$1 = null | undefined | string | number | boolean | symbol | bigint;
type LiteralUnion<LiteralType, BaseType extends Primitive$1> = LiteralType | (BaseType & Record<never, never>);
type JsonObject = { [Key in string]: JsonValue; };
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
declare namespace PackageJson {
  /**
      A person who has been involved in creating or maintaining the package.
      */
  type Person = string | {
    name: string;
    url?: string;
    email?: string;
  };
  type BugsLocation = string | {
    /**
            The URL to the package's issue tracker.
            */
    url?: string;
    /**
            The email address to which issues should be reported.
            */
    email?: string;
  };
  type DirectoryLocations = {
    [directoryType: string]: JsonValue | undefined;
    /**
            Location for executable scripts. Sugar to generate entries in the `bin` property by walking the folder.
            */
    bin?: string;
    /**
            Location for Markdown files.
            */
    doc?: string;
    /**
            Location for example scripts.
            */
    example?: string;
    /**
            Location for the bulk of the library.
            */
    lib?: string;
    /**
            Location for man pages. Sugar to generate a `man` array by walking the folder.
            */
    man?: string;
    /**
            Location for test files.
            */
    test?: string;
  };
  type Scripts = {
    /**
            Run **before** the package is published (Also run on local `npm install` without any arguments).
            */
    prepublish?: string;
    /**
            Run both **before** the package is packed and published, and on local `npm install` without any arguments. This is run **after** `prepublish`, but **before** `prepublishOnly`.
            */
    prepare?: string;
    /**
            Run **before** the package is prepared and packed, **only** on `npm publish`.
            */
    prepublishOnly?: string;
    /**
            Run **before** a tarball is packed (on `npm pack`, `npm publish`, and when installing git dependencies).
            */
    prepack?: string;
    /**
            Run **after** the tarball has been generated and moved to its final destination.
            */
    postpack?: string;
    /**
            Run **after** the package is published.
            */
    publish?: string;
    /**
            Run **after** the package is published.
            */
    postpublish?: string;
    /**
            Run **before** the package is installed.
            */
    preinstall?: string;
    /**
            Run **after** the package is installed.
            */
    install?: string;
    /**
            Run **after** the package is installed and after `install`.
            */
    postinstall?: string;
    /**
            Run **before** the package is uninstalled and before `uninstall`.
            */
    preuninstall?: string;
    /**
            Run **before** the package is uninstalled.
            */
    uninstall?: string;
    /**
            Run **after** the package is uninstalled.
            */
    postuninstall?: string;
    /**
            Run **before** bump the package version and before `version`.
            */
    preversion?: string;
    /**
            Run **before** bump the package version.
            */
    version?: string;
    /**
            Run **after** bump the package version.
            */
    postversion?: string;
    /**
            Run with the `npm test` command, before `test`.
            */
    pretest?: string;
    /**
            Run with the `npm test` command.
            */
    test?: string;
    /**
            Run with the `npm test` command, after `test`.
            */
    posttest?: string;
    /**
            Run with the `npm stop` command, before `stop`.
            */
    prestop?: string;
    /**
            Run with the `npm stop` command.
            */
    stop?: string;
    /**
            Run with the `npm stop` command, after `stop`.
            */
    poststop?: string;
    /**
            Run with the `npm start` command, before `start`.
            */
    prestart?: string;
    /**
            Run with the `npm start` command.
            */
    start?: string;
    /**
            Run with the `npm start` command, after `start`.
            */
    poststart?: string;
    /**
            Run with the `npm restart` command, before `restart`. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.
            */
    prerestart?: string;
    /**
            Run with the `npm restart` command. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.
            */
    restart?: string;
    /**
            Run with the `npm restart` command, after `restart`. Note: `npm restart` will run the `stop` and `start` scripts if no `restart` script is provided.
            */
    postrestart?: string;
  } & Partial<Record<string, string>>;
  /**
      Dependencies of the package. The version range is a string which has one or more space-separated descriptors. Dependencies can also be identified with a tarball or Git URL.
      */
  type Dependency = Partial<Record<string, string>>;
  /**
      Recursive map describing selective dependency version overrides supported by npm.
      */
  type DependencyOverrides = { [packageName in string]: string | undefined | DependencyOverrides; };
  /**
      Specifies requirements for development environment components such as operating systems, runtimes, or package managers. Used to ensure consistent development environments across the team.
      */
  type DevEngineDependency = {
    name: string;
    version?: string;
    onFail?: 'ignore' | 'warn' | 'error' | 'download';
  };
  /**
      A mapping of conditions and the paths to which they resolve.
      */
  type ExportConditions = {
    [condition: string]: Exports;
  };
  /**
      Entry points of a module, optionally with conditions and subpath exports.
      */
  type Exports = null | string | Array<string | ExportConditions> | ExportConditions;
  /**
      Import map entries of a module, optionally with conditions and subpath imports.
      */
  type Imports = {
    [key: `#${string}`]: Exports;
  };
  export interface NonStandardEntryPoints {
    /**
            An ECMAScript module ID that is the primary entry point to the program.
            */
    module?: string;
    /**
            A module ID with untranspiled code that is the primary entry point to the program.
            */
    esnext?: string | {
      [moduleName: string]: string | undefined;
      main?: string;
      browser?: string;
    };
    /**
            A hint to JavaScript bundlers or component tools when packaging modules for client side use.
            */
    browser?: string | Partial<Record<string, string | false>>;
    /**
            Denote which files in your project are "pure" and therefore safe for Webpack to prune if unused.
    
            [Read more.](https://webpack.js.org/guides/tree-shaking/)
            */
    sideEffects?: boolean | string[];
  }
  export type TypeScriptConfiguration = {
    /**
            Location of the bundled TypeScript declaration file.
            */
    types?: string;
    /**
            Version selection map of TypeScript.
            */
    typesVersions?: Partial<Record<string, Partial<Record<string, string[]>>>>;
    /**
            Location of the bundled TypeScript declaration file. Alias of `types`.
            */
    typings?: string;
  };
  /**
      An alternative configuration for workspaces.
      */
  type WorkspaceConfig = {
    /**
            An array of workspace pattern strings which contain the workspace packages.
            */
    packages?: WorkspacePattern[];
    /**
            Designed to solve the problem of packages which break when their `node_modules` are moved to the root workspace directory - a process known as hoisting. For these packages, both within your workspace, and also some that have been installed via `node_modules`, it is important to have a mechanism for preventing the default Yarn workspace behavior. By adding workspace pattern strings here, Yarn will resume non-workspace behavior for any package which matches the defined patterns.
    
            [Supported](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/) by Yarn.
            [Not supported](https://github.com/npm/rfcs/issues/287) by npm.
            */
    nohoist?: WorkspacePattern[];
  };
  /**
      A workspace pattern points to a directory or group of directories which contain packages that should be included in the workspace installation process.
  
      The patterns are handled with [minimatch](https://github.com/isaacs/minimatch).
  
      @example
      `docs` → Include the docs directory and install its dependencies.
      `packages/*` → Include all nested directories within the packages directory, like `packages/cli` and `packages/core`.
      */
  type WorkspacePattern = string;
  export type YarnConfiguration = {
    /**
            If your package only allows one version of a given dependency, and you’d like to enforce the same behavior as `yarn install --flat` on the command-line, set this to `true`.
    
            Note that if your `package.json` contains `"flat": true` and other packages depend on yours (e.g. you are building a library rather than an app), those other packages will also need `"flat": true` in their `package.json` or be installed with `yarn install --flat` on the command-line.
            */
    flat?: boolean;
    /**
            Selective version resolutions. Allows the definition of custom package versions inside dependencies without manual edits in the `yarn.lock` file.
            */
    resolutions?: Dependency;
  };
  export type JSPMConfiguration = {
    /**
            JSPM configuration.
            */
    jspm?: PackageJson;
  };
  /**
      Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Containing standard npm properties.
      */
  export interface PackageJsonStandard {
    /**
            The name of the package.
            */
    name?: string;
    /**
            Package version, parseable by [`node-semver`](https://github.com/npm/node-semver).
            */
    version?: string;
    /**
            Package description, listed in `npm search`.
            */
    description?: string;
    /**
            Keywords associated with package, listed in `npm search`.
            */
    keywords?: string[];
    /**
            The URL to the package's homepage.
            */
    homepage?: LiteralUnion<'.', string>;
    /**
            The URL to the package's issue tracker and/or the email address to which issues should be reported.
            */
    bugs?: BugsLocation;
    /**
            The license for the package.
            */
    license?: string;
    /**
            The licenses for the package.
            */
    licenses?: Array<{
      type?: string;
      url?: string;
    }>;
    author?: Person;
    /**
            A list of people who contributed to the package.
            */
    contributors?: Person[];
    /**
            A list of people who maintain the package.
            */
    maintainers?: Person[];
    /**
            The files included in the package.
            */
    files?: string[];
    /**
            Resolution algorithm for importing ".js" files from the package's scope.
    
            [Read more.](https://nodejs.org/api/esm.html#esm_package_json_type_field)
            */
    type?: 'module' | 'commonjs';
    /**
            The module ID that is the primary entry point to the program.
            */
    main?: string;
    /**
            Subpath exports to define entry points of the package.
    
            [Read more.](https://nodejs.org/api/packages.html#subpath-exports)
            */
    exports?: Exports;
    /**
            Subpath imports to define internal package import maps that only apply to import specifiers from within the package itself.
    
            [Read more.](https://nodejs.org/api/packages.html#subpath-imports)
            */
    imports?: Imports;
    /**
            The executable files that should be installed into the `PATH`.
            */
    bin?: string | Partial<Record<string, string>>;
    /**
            Filenames to put in place for the `man` program to find.
            */
    man?: string | string[];
    /**
            Indicates the structure of the package.
            */
    directories?: DirectoryLocations;
    /**
            Location for the code repository.
            */
    repository?: string | {
      type: string;
      url: string;
      /**
              Relative path to package.json if it is placed in non-root directory (for example if it is part of a monorepo).
  
              [Read more.](https://github.com/npm/rfcs/blob/latest/implemented/0010-monorepo-subdirectory-declaration.md)
              */
      directory?: string;
    };
    /**
            Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point.
            */
    scripts?: Scripts;
    /**
            Is used to set configuration parameters used in package scripts that persist across upgrades.
            */
    config?: JsonObject;
    /**
            The dependencies of the package.
            */
    dependencies?: Dependency;
    /**
            Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling.
            */
    devDependencies?: Dependency;
    /**
            Dependencies that are skipped if they fail to install.
            */
    optionalDependencies?: Dependency;
    /**
            Dependencies that will usually be required by the package user directly or via another dependency.
            */
    peerDependencies?: Dependency;
    /**
            Indicate peer dependencies that are optional.
            */
    peerDependenciesMeta?: Partial<Record<string, {
      optional: true;
    }>>;
    /**
            Package names that are bundled when the package is published.
            */
    bundledDependencies?: string[];
    /**
            Alias of `bundledDependencies`.
            */
    bundleDependencies?: string[];
    /**
            Overrides is used to support selective version overrides using npm, which lets you define custom package versions or ranges inside your dependencies.
            */
    overrides?: DependencyOverrides;
    /**
            Engines that this package runs on.
            */
    engines?: { [EngineName in 'npm' | 'node' | string]?: string; };
    /**
            @deprecated
            */
    engineStrict?: boolean;
    /**
            Operating systems the module runs on.
            */
    os?: Array<LiteralUnion<'aix' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | '!aix' | '!darwin' | '!freebsd' | '!linux' | '!openbsd' | '!sunos' | '!win32', string>>;
    /**
            CPU architectures the module runs on.
            */
    cpu?: Array<LiteralUnion<'arm' | 'arm64' | 'ia32' | 'mips' | 'mipsel' | 'ppc' | 'ppc64' | 's390' | 's390x' | 'x32' | 'x64' | '!arm' | '!arm64' | '!ia32' | '!mips' | '!mipsel' | '!ppc' | '!ppc64' | '!s390' | '!s390x' | '!x32' | '!x64', string>>;
    /**
            Define the runtime and package manager for developing the current project.
            */
    devEngines?: {
      os?: DevEngineDependency | DevEngineDependency[];
      cpu?: DevEngineDependency | DevEngineDependency[];
      libc?: DevEngineDependency | DevEngineDependency[];
      runtime?: DevEngineDependency | DevEngineDependency[];
      packageManager?: DevEngineDependency | DevEngineDependency[];
    };
    /**
            If set to `true`, a warning will be shown if package is installed locally. Useful if the package is primarily a command-line application that should be installed globally.
    
            @deprecated
            */
    preferGlobal?: boolean;
    /**
            If set to `true`, then npm will refuse to publish it.
            */
    private?: boolean;
    /**
            A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default.
            */
    publishConfig?: PublishConfig;
    /**
            Describes and notifies consumers of a package's monetary support information.
    
            [Read more.](https://github.com/npm/rfcs/blob/main/implemented/0017-add-funding-support.md)
            */
    funding?: string | {
      /**
              The type of funding.
              */
      type?: LiteralUnion<'github' | 'opencollective' | 'patreon' | 'individual' | 'foundation' | 'corporation', string>;
      /**
              The URL to the funding page.
              */
      url: string;
    };
    /**
            Used to configure [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) / [Yarn workspaces](https://classic.yarnpkg.com/docs/workspaces/).
    
            Workspaces allow you to manage multiple packages within the same repository in such a way that you only need to run your install command once in order to install all of them in a single pass.
    
            Please note that the top-level `private` property of `package.json` **must** be set to `true` in order to use workspaces.
            */
    workspaces?: WorkspacePattern[] | WorkspaceConfig;
  }
  /**
      Type for [`package.json` file used by the Node.js runtime](https://nodejs.org/api/packages.html#nodejs-packagejson-field-definitions).
      */
  export type NodeJsStandard = {
    /**
            Defines which package manager is expected to be used when working on the current project. It can set to any of the [supported package managers](https://nodejs.org/api/corepack.html#supported-package-managers), and will ensure that your teams use the exact same package manager versions without having to install anything else than Node.js.
    
            __This field is currently experimental and needs to be opted-in; check the [Corepack](https://nodejs.org/api/corepack.html) page for details about the procedure.__
    
            @example
            ```json
            {
                "packageManager": "<package manager name>@<version>"
            }
            ```
            */
    packageManager?: string;
  };
  type PublishConfig = {
    /**
            Additional, less common properties from the [npm docs on `publishConfig`](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig).
            */
    [additionalProperties: string]: JsonValue | undefined;
    /**
            When publishing scoped packages, the access level defaults to restricted. If you want your scoped package to be publicly viewable (and installable) set `--access=public`. The only valid values for access are public and restricted. Unscoped packages always have an access level of public.
            */
    access?: 'public' | 'restricted';
    /**
            The base URL of the npm registry.
    
            Default: `'https://registry.npmjs.org/'`
            */
    registry?: string;
    /**
            The tag to publish the package under.
    
            Default: `'latest'`
            */
    tag?: string;
  };
  export {};
}
/**
Type for [npm's `package.json` file](https://docs.npmjs.com/creating-a-package-json-file). Also includes types for fields used by other popular projects, like TypeScript and Yarn.

@category File
*/
type PackageJson = JsonObject & PackageJson.NodeJsStandard & PackageJson.PackageJsonStandard & PackageJson.NonStandardEntryPoints & PackageJson.TypeScriptConfiguration & PackageJson.YarnConfiguration & PackageJson.JSPMConfiguration;
//#endregion
//#region ../../packages/vovk/dist/types/config.d.ts
type VovkPackageJson = PackageJson & {
  rs_name?: string;
  py_name?: string;
};
type VovkReadmeConfig = {
  banner?: string;
  installCommand?: string;
  description?: string;
};
type VovkSamplesConfig = {
  apiRoot?: string;
  headers?: Record<string, string>;
};
type IncludeExcludeSegments = {
  excludeSegments?: never;
  includeSegments?: string[];
} | {
  excludeSegments?: string[];
  includeSegments?: never;
};
type ClientConfigCommon = {
  enabled?: boolean;
  outDir?: string;
  fromTemplates?: string[];
  prettifyClient?: boolean;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
} & IncludeExcludeSegments;
type ClientConfigComposed = ClientConfigCommon;
type ClientConfigSegmented = ClientConfigCommon;
type VovkBundleConfig = {
  requires?: Record<string, string>;
  prebundleOutDir?: string;
  keepPrebundleDir?: boolean;
  outDir?: string;
  build: (options: {
    outDir: string;
    prebundleDir: string;
    entry: string;
  }) => Promise<void>;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
} & IncludeExcludeSegments;
type GeneratorConfigImports = {
  fetcher?: string;
  validateOnClient?: string | null;
  createRPC?: string;
};
type SegmentConfigImports = {
  fetcher?: string;
  validateOnClient?: string | null;
};
interface VovkOutputConfig<TImports extends GeneratorConfigImports = GeneratorConfigImports> {
  origin?: string | null;
  package?: VovkPackageJson;
  readme?: VovkReadmeConfig;
  samples?: VovkSamplesConfig;
  openAPIObject?: Partial<OpenAPIObject>;
  reExports?: Record<string, string>;
  imports?: TImports;
}
type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  composedClient?: Omit<ClientConfigComposed, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  requires?: Record<string, string>;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
};
type GetOpenAPINameFn = (config: {
  operationObject: VovkOperationObject;
  method: HttpMethod;
  path: string;
  openAPIObject: OpenAPIObject;
}) => string;
interface VovkOpenAPIMixin {
  source: {
    file: string;
  } | {
    url: string;
    fallback?: string;
  } | {
    object: OpenAPIObject;
  };
  apiRoot?: string;
  getModuleName?: (string & {}) | 'api' | GetOpenAPINameFn;
  getMethodName?: 'camel-case-operation-id' | 'auto' | GetOpenAPINameFn;
  /**
   * Keep only operations the predicate returns `true` for; omitted = keep all. Runs before
   * `getModuleName`/`getMethodName`, so a module whose operations are all filtered out is never created.
   */
  filterOperations?: (config: Parameters<GetOpenAPINameFn>[0]) => boolean;
  /**
   * Prune `meta.openAPIObject.components.schemas` to the `$ref` closure of kept operations (shrinks big
   * specs); removes unreferenced `Mixins.*` types, keep `false` (default) if you import those directly.
   */
  pruneComponents?: boolean;
  errorMessageKey?: string;
  mixinName?: string;
}
interface VovkOpenAPIMixinNormalized extends Omit<VovkOpenAPIMixin, 'source' | 'getMethodName' | 'getModuleName'> {
  source: Exclude<NonNullable<VovkOpenAPIMixin['source']>, {
    file: string;
  } | {
    url: string;
  }>;
  getMethodName: GetOpenAPINameFn;
  getModuleName: GetOpenAPINameFn;
}
interface VovkSegmentConfig extends VovkOutputConfig<SegmentConfigImports> {
  rootEntry?: string;
  segmentNameOverride?: string;
  openAPIMixin?: VovkOpenAPIMixin;
}
type VovkUserConfig = {
  $schema?: typeof VovkSchemaIdEnum.CONFIG | (string & {});
  exposeConfigKeys?: boolean | (keyof VovkStrictConfig | (string & {}))[];
  schemaOutDir?: string;
  modulesDir?: string;
  rootEntry?: string;
  logLevel?: 'error' | 'trace' | 'debug' | 'info' | 'warn';
  libs?: {
    ajv?: KnownAny;
    [key: string]: KnownAny;
  };
  devHttps?: boolean;
  composedClient?: ClientConfigComposed;
  segmentedClient?: ClientConfigSegmented;
  bundle?: VovkBundleConfig;
  clientTemplateDefs?: Record<string, ClientTemplateDef>;
  rootSegmentModulesDirName?: string;
  moduleTemplates?: {
    service?: string;
    controller?: string;
    [key: string]: string | undefined;
  };
  outputConfig?: VovkOutputConfig<GeneratorConfigImports> & {
    segments?: Record<string, VovkSegmentConfig>;
  };
};
type VovkStrictConfig = Required<Omit<VovkUserConfig, 'exposeConfigKeys' | 'libs' | 'composedClient' | 'segmentedClient' | 'bundle'>> & {
  exposeConfigKeys: (keyof VovkStrictConfig | string)[];
  bundle: Required<Omit<NonNullable<VovkUserConfig['bundle']>, 'includeSegments' | 'excludeSegments'>> & IncludeExcludeSegments;
  libs: Record<string, KnownAny>;
  composedClient: RequireFields<ClientConfigComposed, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  outputConfig: VovkOutputConfig<GeneratorConfigImports> & {
    segments?: Record<string, Omit<VovkSegmentConfig, 'openAPIMixin'> & {
      openAPIMixin?: VovkOpenAPIMixinNormalized;
    }>;
  };
};
//#endregion
//#region ../../packages/vovk/dist/req/parse-body.d.ts
/** Application MIME types that are parsed as text by parseBody. */
declare const textTypes: readonly ['application/xml', 'application/xhtml+xml', 'application/javascript', 'application/x-javascript', 'application/ecmascript', 'application/yaml', 'application/x-yaml', 'application/graphql', 'application/sql', 'application/toml', 'application/x-ndjson', 'application/ndjson', 'application/jsonl', 'application/jsonlines', 'application/x-jsonlines'];
//#endregion
//#region ../../packages/vovk/dist/types/validation.d.ts
interface CombinedProps<Input = unknown, Output = Input> extends StandardSchemaV1$1.Props<Input, Output>, StandardJSONSchemaV1$1.Props<Input, Output> {}
/**
 * An interface that combines StandardJSONSchema and StandardSchema.
 * */
interface CombinedSpec<Input = unknown, Output = Input> {
  '~standard': CombinedProps<Input, Output>;
}
declare namespace CombinedSpec {
  type Target = StandardJSONSchemaV1$1.Target;
  type InferInput<T extends StandardSchemaV1$1> = StandardSchemaV1$1.InferInput<T>;
  type InferOutput<T extends StandardSchemaV1$1> = StandardSchemaV1$1.InferOutput<T>;
  type SuccessResult<T> = StandardSchemaV1$1.SuccessResult<T>;
}
/** The type of a procedure() schema option that is left out. */
type VovkNoSchema = CombinedSpec & {
  readonly __noSchema: true;
};
type EmptyValueCheck<T extends CombinedSpec> = unknown extends CombinedSpec.InferInput<T> ? CombinedSpec.InferOutput<T> : CombinedSpec.InferInput<T>;
/**
 * What a procedure's RPC method takes: a key for each schema, typed with the schema's input and optional when the
 * server accepts a request without it (it validates a missing body as undefined, a missing query or params as {}).
 */
type VovkProcedureInput<TBody extends CombinedSpec, TQuery extends CombinedSpec, TParams extends CombinedSpec, TContentType extends ContentType[]> = ([TBody] extends [VovkNoSchema] ? TContentType[number] extends 'application/json' ? unknown : {
  body?: BodyTypeFromContentType<TContentType, unknown>;
} : undefined extends EmptyValueCheck<TBody> ? {
  body?: BodyTypeFromContentType<TContentType, CombinedSpec.InferInput<TBody>>;
} : {
  body: BodyTypeFromContentType<TContentType, CombinedSpec.InferInput<TBody>>;
}) & ([TQuery] extends [VovkNoSchema] ? unknown : {} extends EmptyValueCheck<TQuery> ? {
  query?: CombinedSpec.InferInput<TQuery>;
} : {
  query: CombinedSpec.InferInput<TQuery>;
}) & ([TParams] extends [VovkNoSchema] ? {
  params?: Record<string, string>;
} : {} extends EmptyValueCheck<TParams> ? {
  params?: CombinedSpec.InferInput<TParams>;
} : {
  params: CombinedSpec.InferInput<TParams>;
});
/** Application MIME types that are parsed as text (derived from parseBody.ts textTypes). */
type TextLikeApplicationType = (typeof textTypes)[number];
type ContentType = 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'text/plain' | 'application/octet-stream' | TextLikeApplicationType | `text/${string}` | `application/${string}` | `${string}+json` | `${string}+xml` | `${string}+text` | `${string}+yaml` | `${string}+json-seq` | '*/*' | (string & {});
type BodyTypeFromContentType<T extends ContentType[], TBody> = T[number] extends (infer A) ? A extends '*/*' ? TBody | URLSearchParams | FormData | ArrayBuffer | Uint8Array | Blob : A extends 'application/json' | `${string}+json` ? TBody | Blob : A extends 'multipart/form-data' ? TBody | FormData | Blob : A extends 'application/x-www-form-urlencoded' ? TBody | URLSearchParams | FormData | Blob : A extends `text/${string}` | TextLikeApplicationType | `${string}+xml` | `${string}+text` | `${string}+yaml` | `${string}+json-seq` ? string | Blob : ArrayBuffer | Uint8Array | Blob : never;
/**
 * Client-side validation function type.
 * @see https://vovk.dev/imports
 */
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
//#region ../../packages/vovk/dist/types/json-schema.d.ts
type Type = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'integer';
/**
 * Base JSON Schema type used in Vovk.ts for validation and code generation.
 * @see https://vovk.dev/schema
 */
type VovkJSONSchemaBase = {
  $schema?: 'https://json-schema.org/draft/2020-12/schema' | 'http://json-schema.org/draft-07/schema#';
  type?: Type | Type[];
  format?: string;
  pattern?: string;
  $ref?: string;
  items?: boolean | VovkJSONSchemaBase;
  prefixItems?: VovkJSONSchemaBase[];
  additionalItems?: boolean | VovkJSONSchemaBase;
  enum?: KnownAny[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  title?: string;
  description?: string;
  properties?: {
    [key: string]: VovkJSONSchemaBase;
  };
  required?: string[];
  examples?: KnownAny[];
  not?: VovkJSONSchemaBase;
  $defs?: {
    [key: string]: VovkJSONSchemaBase;
  };
  definitions?: {
    [key: string]: VovkJSONSchemaBase;
  };
  additionalProperties?: boolean | VovkJSONSchemaBase;
  anyOf?: VovkJSONSchemaBase[];
  oneOf?: VovkJSONSchemaBase[];
  allOf?: VovkJSONSchemaBase[];
  const?: KnownAny;
  example?: KnownAny;
  contentEncoding?: string;
  contentMediaType?: string;
  minLength?: number;
  maxLength?: number;
  'x-contentType'?: ContentType[];
  'x-tsType'?: string;
};
//#endregion
//#region ../../packages/vovk/dist/types/core.d.ts
/**
 * Schema for an individual handler, available as MyRPC.myHandler.schema and MyController.myHandler.schema
 */
type VovkHandlerSchema = {
  path: string;
  httpMethod: string;
  validation?: {
    query?: VovkJSONSchemaBase;
    body?: VovkJSONSchemaBase;
    params?: VovkJSONSchemaBase;
    output?: VovkJSONSchemaBase;
    iteration?: VovkJSONSchemaBase;
  };
  operationObject?: VovkOperationObject;
  misc?: Record<string, unknown>;
};
/**
 * Represents the schema of a controller
 */
type VovkControllerSchema = {
  rpcModuleName: string;
  originalControllerName?: string;
  prefix?: string;
  forceApiRoot?: string;
  handlers: {
    [key: string]: VovkHandlerSchema;
  };
};
/**
 * Represents the schema of a segment
 */
type VovkSegmentSchema = {
  $schema: typeof VovkSchemaIdEnum.SEGMENT | (string & {});
  emitSchema: boolean;
  segmentName: string;
  segmentType: 'segment' | 'mixin' | (string & {});
  forceApiRoot?: string;
  controllers: {
    [key: string]: VovkControllerSchema;
  };
  meta?: {
    openAPIObject?: Partial<Omit<OpenAPIObject, 'paths'>>;
    package?: VovkPackageJson;
  };
};
/**
 * Represents the meta schema
 */
type VovkMetaSchema = {
  $schema: typeof VovkSchemaIdEnum.META | (string & {});
  config: RequireFields<Partial<VovkStrictConfig>, '$schema'>;
  openAPIObject?: Partial<OpenAPIObject>;
};
/**
 * Represents the full schema of composed client or a segment in segmented client.
 * @see https://vovk.dev/schema
 */
type VovkSchema = {
  $schema: typeof VovkSchemaIdEnum.SCHEMA | (string & {});
  segments: {
    [key: string]: VovkSegmentSchema;
  };
  meta?: VovkMetaSchema;
};
type StreamAbortMessage = {
  isError: true;
  reason: KnownAny;
  statusCode?: HttpStatus;
};
type VovkControllerInternal = {
  _segmentName: string;
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  _prefix?: string;
  _handlers: VovkControllerSchema['handlers'];
  _handlersMetadata?: Record<string, {
    staticParams?: Record<string, string>[];
  }>;
  _onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  _onSuccess?: (resp: unknown, req: VovkRequest) => void | Promise<void>;
  _onBefore?: (req: VovkRequest) => void | Promise<void>;
};
type VovkController = StaticClass & VovkControllerInternal & {
  [key: string]: unknown;
};
type ControllerStaticMethod<REQ extends VovkRequest = VovkRequest, TParams extends {
  [key: string]: string;
} = KnownAny> = ((req: REQ, params: TParams) => unknown) & {
  _controller?: VovkController;
};
//#endregion
//#region ../../packages/vovk/dist/client/default-handler.d.ts
declare const defaultHandler: ({ response, schema }: {
  response: Response;
  schema: VovkHandlerSchema;
}) => Promise<unknown>;
//#endregion
//#region ../../packages/vovk/dist/client/default-stream-handler.d.ts
declare const defaultStreamHandler: ({ response, abortController }: {
  response: Response;
  abortController: AbortController;
}) => VovkStreamAsyncIterable<unknown>;
//#endregion
//#region ../../packages/vovk/dist/types/client.d.ts
type OmitNullable<T> = { [K in keyof T as T[K] extends null | undefined ? never : K]: T[K]; };
type MetaInput = {
  meta?: {
    [key: string]: KnownAny;
  };
};
type IsDeclared<T> = unknown extends T ? false : [T] extends [null | undefined] ? false : true;
type PlainInput<TBody, TQuery, TParams> = (IsDeclared<TBody> extends true ? undefined extends TBody ? {
  body?: TBody;
} : {
  body: TBody;
} : unknown) & (IsDeclared<TQuery> extends true ? ({} extends TQuery ? {
  query?: TQuery;
} : {
  query: TQuery;
}) : unknown) & (IsDeclared<TParams> extends true ? ({} extends TParams ? {
  params?: TParams;
} : {
  params: TParams;
}) : unknown);
type RequestParts<TReq> = TReq extends {
  vovk: {
    body: () => Promise<infer TBody>;
    query: () => infer TQuery;
    params: () => infer TParams;
  };
} ? PlainInput<TBody, TQuery, TParams> : unknown;
type StaticMethodLike = ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
  __types?: {
    body: unknown;
    contentType: ContentType[];
  };
};
type StaticMethodInput<T extends StaticMethodLike> = OmitNullable<(T extends {
  __types: {
    input: infer TInput;
  };
} ? TInput : RequestParts<Parameters<T>[0]> & PlainInput<unknown, unknown, Parameters<T>[1]>) & MetaInput>;
type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;
type DisposeSymbol = SymbolConstructor extends {
  readonly dispose: infer S extends symbol;
} ? S : never;
type AsyncDisposeSymbol = SymbolConstructor extends {
  readonly asyncDispose: infer S extends symbol;
} ? S : never;
type VovkStreamAsyncIterable<T> = {
  status: number;
  asPromise: () => Promise<T[]>;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  abortSilently: () => void;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  abortController: AbortController;
} & { [K in DisposeSymbol | AsyncDisposeSymbol]: () => Promise<void> | void; };
type NextResponseBody<R> = { [K in keyof R]: K extends symbol ? (R[K] extends {
  cookies: unknown;
  body?: infer B;
} ? B : never) : never; }[keyof R];
type ActualReturnType<T extends ControllerStaticMethod> = T extends {
  __handleFn: (...args: KnownAny[]) => infer R;
} ? R : ReturnType<T>;
type StaticMethodReturn<T extends ControllerStaticMethod> = [IsAny$1<Awaited<ActualReturnType<T>>>] extends [true] ? ActualReturnType<T> : ActualReturnType<T> extends Response | Promise<Response> ? [NextResponseBody<Awaited<ActualReturnType<T>>>] extends [never] ? Awaited<ActualReturnType<T>> : NextResponseBody<Awaited<ActualReturnType<T>>> : ActualReturnType<T>;
type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;
type StreamItem<T extends ControllerStaticMethod> = T extends {
  __types: {
    iteration: infer U;
  };
} ? unknown extends U ? HandlerStreamItem<T> : U : HandlerStreamItem<T>;
type HandlerStreamItem<T extends ControllerStaticMethod> = [IsAny$1<Awaited<ActualReturnType<T>>>] extends [true] ? never : StreamItemOf<Awaited<ActualReturnType<T>>>;
type StreamItemOf<R> = [R] extends [JSONLinesResponder<infer U>] ? U : [R] extends [string | readonly unknown[]] ? never : [R] extends [Iterable<infer U> | AsyncIterable<infer U> | Iterator<infer U> | AsyncIterator<infer U>] ? U : never;
type ClientMethodData<T extends ControllerStaticMethod> = [StreamItem<T>] extends [never] ? Awaited<StaticMethodReturn<T>> : VovkStreamAsyncIterable<StreamItem<T>>;
type StaticMethodOptions<T extends (req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration, R, F extends VovkFetcherOptions<KnownAny>> = Partial<TFetcherOptions & {
  transform: (staticMethodReturn: ClientMethodData<T>, resp: Response) => R;
  fetcher: VovkFetcher<F>;
}>;
type ClientMethodReturn<T extends (req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>, TStreamIteration, R> = [IsAny$1<R>] extends [true] ? Promise<R> : unknown extends R ? [StreamItem<T>] extends [never] ? StaticMethodReturnPromise<T> : Promise<VovkStreamAsyncIterable<StreamItem<T>>> : Promise<Awaited<R>>;
type URLInput<T extends StaticMethodLike> = Pick<Prettify$1<StaticMethodInput<T>>, Extract<'params' | 'query', keyof Prettify$1<StaticMethodInput<T>>>>;
type ClientMethod<T extends ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>) & {
  __types?: {
    body: KnownAny;
    query: KnownAny;
    params: KnownAny;
    output: KnownAny;
    iteration: KnownAny;
    contentType: ContentType[];
  };
}, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration extends KnownAny = unknown> = (IsEmptyObject<StaticMethodInput<T>> extends true ? <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(options?: Prettify$1<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R> : <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(options: Prettify$1<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  getURL: IsEmptyObject<URLInput<T>> extends true ? (urlInput?: URLInput<T> & {
    apiRoot?: string;
  }) => string : (urlInput: URLInput<T> & {
    apiRoot?: string;
  }) => string;
  apiRoot: string;
  queryKey: (key?: unknown[]) => unknown[];
  __types: T['__types'];
};
type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K]; };
type IsHandler<F> = F extends (() => unknown) ? true : F extends ((req: infer R, ...args: KnownAny[]) => unknown) ? unknown extends R ? true : [R] extends [Request] ? true : false : false;
type VovkClientWithNever<T, TFetcherOptions extends {
  [key: string]: KnownAny;
}> = { [K in keyof T]: T[K] extends ((...args: KnownAny) => KnownAny) ? IsHandler<T[K]> extends true ? ClientMethod<T[K], TFetcherOptions> : never : never; };
type VovkRPCModule<T, TFetcherOptions extends {
  [key: string]: KnownAny;
}> = OmitNever<VovkClientWithNever<T, TFetcherOptions>> & {
  withDefaults: (newOptions?: VovkFetcherOptions<TFetcherOptions>) => VovkRPCModule<T, TFetcherOptions>;
};
/**
 * Fetcher function type for client requests.
 * @see https://vovk.dev/imports
 */
type VovkFetcher<TFetcherOptions> = (options: {
  name: string;
  httpMethod: HttpMethod;
  getURL: (data: {
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
type VovkFetcherOptions<T> = T & {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<T> | Promise<{
    validateOnClient: VovkValidateOnClient<T>;
  }>;
  interpretAs?: string;
  init?: RequestInit;
};
//#endregion
//#region ../../node_modules/zod/v4/core/json-schema.d.cts
type _JSONSchema = boolean | JSONSchema;
type SchemaType = "object" | "array" | "string" | "number" | "boolean" | "null" | "integer";
type JSONSchema = {
  [k: string]: unknown;
  $schema?: "https://json-schema.org/draft/2020-12/schema" | "http://json-schema.org/draft-07/schema#" | "http://json-schema.org/draft-04/schema#";
  $id?: string;
  $anchor?: string;
  $ref?: string;
  $dynamicRef?: string;
  $dynamicAnchor?: string;
  $vocabulary?: Record<string, boolean>;
  $comment?: string;
  $defs?: Record<string, JSONSchema>;
  type?: SchemaType | SchemaType[];
  additionalItems?: _JSONSchema;
  unevaluatedItems?: _JSONSchema;
  prefixItems?: _JSONSchema[];
  items?: _JSONSchema | _JSONSchema[];
  contains?: _JSONSchema;
  additionalProperties?: _JSONSchema;
  unevaluatedProperties?: _JSONSchema;
  properties?: Record<string, _JSONSchema>;
  patternProperties?: Record<string, _JSONSchema>;
  dependentSchemas?: Record<string, _JSONSchema>;
  propertyNames?: _JSONSchema;
  if?: _JSONSchema;
  then?: _JSONSchema;
  else?: _JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: _JSONSchema;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number | boolean;
  minimum?: number;
  exclusiveMinimum?: number | boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxContains?: number;
  minContains?: number;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  dependentRequired?: Record<string, string[]>;
  enum?: Array<string | number | boolean | null>;
  const?: string | number | boolean | null;
  id?: string;
  title?: string;
  description?: string;
  default?: unknown;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  nullable?: boolean;
  examples?: unknown[];
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  contentSchema?: JSONSchema;
  _prefault?: unknown;
};
type BaseSchema = JSONSchema;
//#endregion
//#region ../../node_modules/zod/v4/core/standard-schema.d.cts
/** The Standard interface. */
interface StandardTypedV1<Input = unknown, Output = Input> {
  /** The Standard properties. */
  readonly "~standard": StandardTypedV1.Props<Input, Output>;
}
declare namespace StandardTypedV1 {
  /** The Standard properties interface. */
  interface Props<Input = unknown, Output = Input> {
    /** The version number of the standard. */
    readonly version: 1;
    /** The vendor name of the schema library. */
    readonly vendor: string;
    /** Inferred types associated with the schema. */
    readonly types?: Types<Input, Output> | undefined;
  }
  /** The Standard types interface. */
  interface Types<Input = unknown, Output = Input> {
    /** The input type of the schema. */
    readonly input: Input;
    /** The output type of the schema. */
    readonly output: Output;
  }
  /** Infers the input type of a Standard. */
  type InferInput<Schema extends StandardTypedV1> = NonNullable<Schema["~standard"]["types"]>["input"];
  /** Infers the output type of a Standard. */
  type InferOutput<Schema extends StandardTypedV1> = NonNullable<Schema["~standard"]["types"]>["output"];
}
/** The Standard Schema interface. */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": StandardSchemaV1.Props<Input, Output>;
}
declare namespace StandardSchemaV1 {
  /** The Standard Schema properties interface. */
  interface Props<Input = unknown, Output = Input> extends StandardTypedV1.Props<Input, Output> {
    /** Validates unknown input values. */
    readonly validate: (value: unknown, options?: StandardSchemaV1.Options | undefined) => Result<Output> | Promise<Result<Output>>;
  }
  /** The result interface of the validate function. */
  type Result<Output> = SuccessResult<Output> | FailureResult;
  /** The result interface if validation succeeds. */
  interface SuccessResult<Output> {
    /** The typed output value. */
    readonly value: Output;
    /** The absence of issues indicates success. */
    readonly issues?: undefined;
  }
  interface Options {
    /** Implicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }
  /** The result interface if validation fails. */
  interface FailureResult {
    /** The issues of failed validation. */
    readonly issues: ReadonlyArray<Issue>;
  }
  /** The issue interface of the failure output. */
  interface Issue {
    /** The error message of the issue. */
    readonly message: string;
    /** The path of the issue, if any. */
    readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
  }
  /** The path segment interface of the issue. */
  interface PathSegment {
    /** The key representing a path segment. */
    readonly key: PropertyKey;
  }
  /** The Standard types interface. */
  interface Types<Input = unknown, Output = Input> extends StandardTypedV1.Types<Input, Output> {}
  /** Infers the input type of a Standard. */
  type InferInput<Schema extends StandardTypedV1> = StandardTypedV1.InferInput<Schema>;
  /** Infers the output type of a Standard. */
  type InferOutput<Schema extends StandardTypedV1> = StandardTypedV1.InferOutput<Schema>;
}
/** The Standard JSON Schema interface. */
interface StandardJSONSchemaV1<Input = unknown, Output = Input> {
  /** The Standard JSON Schema properties. */
  readonly "~standard": StandardJSONSchemaV1.Props<Input, Output>;
}
declare namespace StandardJSONSchemaV1 {
  /** The Standard JSON Schema properties interface. */
  interface Props<Input = unknown, Output = Input> extends StandardTypedV1.Props<Input, Output> {
    /** Methods for generating the input/output JSON Schema. */
    readonly jsonSchema: Converter;
  }
  /** The Standard JSON Schema converter interface. */
  interface Converter {
    /** Converts the input type to JSON Schema. May throw if conversion is not supported. */
    readonly input: (options: StandardJSONSchemaV1.Options) => Record<string, unknown>;
    /** Converts the output type to JSON Schema. May throw if conversion is not supported. */
    readonly output: (options: StandardJSONSchemaV1.Options) => Record<string, unknown>;
  }
  /** The target version of the generated JSON Schema.
   *
   * It is *strongly recommended* that implementers support `"draft-2020-12"` and `"draft-07"`, as they are both in wide use.
   *
   * The `"openapi-3.0"` target is intended as a standardized specifier for OpenAPI 3.0 which is a superset of JSON Schema `"draft-04"`.
   *
   * All other targets can be implemented on a best-effort basis. Libraries should throw if they don't support a specified target.
   */
  type Target = "draft-2020-12" | "draft-07" | "openapi-3.0" | ({} & string);
  /** The options for the input/output methods. */
  interface Options {
    /** Specifies the target version of the generated JSON Schema. Support for all versions is on a best-effort basis. If a given version is not supported, the library should throw. */
    readonly target: Target;
    /** Implicit support for additional vendor-specific parameters, if needed. */
    readonly libraryOptions?: Record<string, unknown> | undefined;
  }
  /** The Standard types interface. */
  interface Types<Input = unknown, Output = Input> extends StandardTypedV1.Types<Input, Output> {}
  /** Infers the input type of a Standard. */
  type InferInput<Schema extends StandardTypedV1> = StandardTypedV1.InferInput<Schema>;
  /** Infers the output type of a Standard. */
  type InferOutput<Schema extends StandardTypedV1> = StandardTypedV1.InferOutput<Schema>;
}
interface StandardSchemaWithJSONProps<Input = unknown, Output = Input> extends StandardSchemaV1.Props<Input, Output>, StandardJSONSchemaV1.Props<Input, Output> {}
//#endregion
//#region ../../node_modules/zod/v4/core/registries.d.cts
declare const $output: unique symbol;
type $output = typeof $output;
declare const $input: unique symbol;
type $input = typeof $input;
type $replace<Meta, S extends $ZodType> = Meta extends $output ? output<S> : Meta extends $input ? input<S> : Meta extends (infer M)[] ? $replace<M, S>[] : Meta extends ((...args: infer P) => infer R) ? (...args: { [K in keyof P]: $replace<P[K], S>; }) => $replace<R, S> : Meta extends object ? { [K in keyof Meta]: $replace<Meta[K], S>; } : Meta;
type MetadataType = object | undefined;
declare class $ZodRegistry<Meta extends MetadataType = MetadataType, Schema extends $ZodType = $ZodType> {
  _meta: Meta;
  _schema: Schema;
  _map: WeakMap<Schema, $replace<Meta, Schema>>;
  _idmap: Map<string, Schema>;
  add<S extends Schema>(schema: S, ..._meta: undefined extends Meta ? [$replace<Meta, S>?] : [$replace<Meta, S>]): this;
  clear(): this;
  remove(schema: Schema): this;
  get<S extends Schema>(schema: S): $replace<Meta, S> | undefined;
  has(schema: Schema): boolean;
}
interface JSONSchemaMeta {
  id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  deprecated?: boolean | undefined;
  [k: string]: unknown;
}
interface GlobalMeta extends JSONSchemaMeta {}
//#endregion
//#region ../../node_modules/zod/v4/core/to-json-schema.d.cts
type Processor<T extends $ZodType = $ZodType> = (schema: T, ctx: ToJSONSchemaContext, json: BaseSchema, params: ProcessParams) => void;
/**
 * Called for each schema that has no JSON Schema equivalent. Return a JSON Schema to use in its
 * place, `"any"` to fall back to the `unrepresentable: "any"` behavior, or `"throw"`/`undefined` to
 * throw the default error. Throwing from the handler propagates, so custom errors work too.
 */
type UnrepresentableHandler<T extends $ZodType = $ZodType> = (ctx: {
  zodSchema: T;
  path: (string | number)[];
  /** The error Zod would throw. Distinguishes sites that share a `zodSchema`, e.g. an `undefined`
   *  vs a `bigint` member of the same literal. */
  message: string;
}) => BaseSchema | "throw" | "any" | undefined;
interface JSONSchemaGeneratorParams {
  processors: Record<string, Processor>;
  /** A registry used to look up metadata for each schema. Any schema with an `id` property will be extracted as a $def.
   *  @default globalRegistry */
  metadata?: $ZodRegistry<Record<string, any>>;
  /** The JSON Schema version to target.
   * - `"draft-2020-12"` — Default. JSON Schema Draft 2020-12
   * - `"draft-07"` — JSON Schema Draft 7
   * - `"draft-04"` — JSON Schema Draft 4
   * - `"openapi-3.0"` — OpenAPI 3.0 Schema Object */
  target?: "draft-04" | "draft-07" | "draft-2020-12" | "openapi-3.0" | ({} & string) | undefined;
  /** How to handle unrepresentable types.
   * - `"throw"` — Default. Unrepresentable types throw an error
   * - `"any"` — Unrepresentable types become `{}`
   * - A function — called once per unrepresentable schema; see {@link UnrepresentableHandler}. */
  unrepresentable?: "throw" | "any" | UnrepresentableHandler<$ZodTypes>;
  /** Arbitrary custom logic that can be used to modify the generated JSON Schema. */
  override?: (ctx: {
    zodSchema: $ZodTypes;
    jsonSchema: BaseSchema;
    path: (string | number)[];
  }) => void;
  /** Whether to extract the `"input"` or `"output"` type. Relevant to transforms, defaults, coerced primitives, etc.
   * - `"output"` — Default. Convert the output schema.
   * - `"input"` — Convert the input schema. */
  io?: "input" | "output";
  cycles?: "ref" | "throw";
  reused?: "ref" | "inline";
  external?: {
    registry: $ZodRegistry<{
      id?: string | undefined;
    }>;
    uri?: ((id: string) => string) | undefined;
    defs: Record<string, BaseSchema>;
  } | undefined;
}
/**
 * Parameters for the toJSONSchema function.
 */
type ToJSONSchemaParams = Omit<JSONSchemaGeneratorParams, "processors" | "external">;
interface ProcessParams {
  schemaPath: $ZodType[];
  path: (string | number)[];
}
interface Seen {
  /** JSON Schema result for this Zod schema */
  schema: BaseSchema;
  /** A cached version of the schema that doesn't get overwritten during ref resolution */
  def?: BaseSchema;
  defId?: string | undefined;
  /** Number of times this schema was encountered during traversal */
  count: number;
  /** Cycle path */
  cycle?: (string | number)[] | undefined;
  isParent?: boolean | undefined;
  /** Schema to inherit JSON Schema properties from (set by processor for wrappers) */
  ref?: $ZodType | null;
  /** JSON Schema property path for this schema */
  path?: (string | number)[] | undefined;
}
interface ToJSONSchemaContext {
  processors: Record<string, Processor>;
  metadataRegistry: $ZodRegistry<Record<string, any>>;
  target: "draft-04" | "draft-07" | "draft-2020-12" | "openapi-3.0" | ({} & string);
  unrepresentable: "throw" | "any" | UnrepresentableHandler;
  override: (ctx: {
    zodSchema: $ZodType;
    jsonSchema: BaseSchema;
    path: (string | number)[];
  }) => void;
  io: "input" | "output";
  counter: number;
  seen: Map<$ZodType, Seen>;
  /** Registry conversions share one `seen` map across every emitted schema. These hold the
   * `external` the whole-map passes below last ran for, so the passes are not repeated once per
   * schema — and still re-run if the map grows or `external` is swapped. `sharedEmitDoneFor`
   * covers both passes in `finalize`: the ref flattening and the `$defs` build.
   *
   * The passes are valid only while nothing they read has changed, so both are cleared in
   * `processSchema()` when the map grows, and in `JSONSchemaGenerator.emit()`, which can also change
   * the `cycles` and `reused` they branch on.
   *
   * One case is deliberately not covered: an `override` callback that writes to
   * `metadataRegistry` mid-conversion. It runs inside `finalize`, so a registry conversion has
   * nowhere left to clear the guards, and later schemas keep the ids the first pass saw. That
   * output was never coherent — before this, whether a shared subschema was inlined or extracted
   * depended on which registry entry happened to be emitted when the callback fired. */
  sharedDefsExtractedFor?: ToJSONSchemaContext["external"];
  sharedEmitDoneFor?: ToJSONSchemaContext["external"];
  cycles: "ref" | "throw";
  reused: "ref" | "inline";
  /** The `allOf` array of each intersection encountered during traversal, innermost first. `finalize` folds every emitted object holding one; see `foldIntersection`. */
  intersections: BaseSchema[][];
  /** Rewrites a processor deferred to `finalize`, where the flatten has resolved every ref and the union branches are in place. */
  deferred: (() => void)[];
  external?: {
    registry: $ZodRegistry<{
      id?: string | undefined;
    }>;
    uri?: ((id: string) => string) | undefined;
    defs: Record<string, BaseSchema>;
  } | undefined;
}
type ZodStandardSchemaWithJSON$1<T> = StandardSchemaWithJSONProps<input<T>, output<T>>;
interface ZodStandardJSONSchemaPayload<T> extends BaseSchema {
  "~standard": ZodStandardSchemaWithJSON$1<T>;
}
//#endregion
//#region ../../node_modules/zod/v4/core/util.d.cts
type JWTAlgorithm = "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512" | "ES256" | "ES384" | "ES512" | "PS256" | "PS384" | "PS512" | "EdDSA" | (string & {});
type MimeTypes = "application/json" | "application/xml" | "application/x-www-form-urlencoded" | "application/javascript" | "application/pdf" | "application/zip" | "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-powerpoint" | "application/vnd.openxmlformats-officedocument.presentationml.presentation" | "application/octet-stream" | "application/graphql" | "text/html" | "text/plain" | "text/css" | "text/javascript" | "text/csv" | "image/png" | "image/jpeg" | "image/gif" | "image/svg+xml" | "image/webp" | "audio/mpeg" | "audio/ogg" | "audio/wav" | "audio/webm" | "video/mp4" | "video/webm" | "video/ogg" | "font/woff" | "font/woff2" | "font/ttf" | "font/otf" | "multipart/form-data" | (string & {});
type IsAny<T> = 0 extends 1 & T ? true : false;
type Omit$1<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type MakePartial<T, K extends keyof T> = Omit$1<T, K> & InexactPartial<Pick<T, K>>;
type NoUndefined<T> = T extends undefined ? never : T;
type LoosePartial<T extends object> = InexactPartial<T> & {
  [k: string]: unknown;
};
type Mask<Keys extends PropertyKey> = { [K in Keys]?: true; };
type Writeable<T> = { -readonly [P in keyof T]: T[P]; } & {};
type InexactPartial<T> = { [P in keyof T]?: T[P] | undefined; };
type BuiltIn = (((...args: any[]) => any) | (new (...args: any[]) => any)) | {
  readonly [Symbol.toStringTag]: string;
} | Date | Error | Generator | Promise<unknown> | RegExp;
type MakeReadonly<T> = T extends Map<infer K, infer V> ? ReadonlyMap<K, V> : T extends Set<infer V> ? ReadonlySet<V> : T extends [infer Head, ...infer Tail] ? readonly [Head, ...Tail] : T extends Array<infer V> ? ReadonlyArray<V> : T extends BuiltIn ? T : Readonly<T>;
type SomeObject = Record<PropertyKey, any>;
type Identity<T> = T;
type Flatten<T> = Identity<{ [k in keyof T]: T[k]; }>;
type Prettify<T> = { [K in keyof T]: T[K]; } & {};
type Extend<A extends SomeObject, B extends SomeObject> = Flatten<keyof A & keyof B extends never ? A & B : { [K in keyof A as K extends keyof B ? never : K]: A[K]; } & { [K in keyof B]: B[K]; }>;
type TupleItems = ReadonlyArray<SomeType>;
type AnyFunc = (...args: any[]) => any;
type MaybeAsync<T> = T | Promise<T>;
type EnumValue = string | number;
type EnumLike = Readonly<Record<string, EnumValue>>;
type ToEnum<T extends EnumValue> = Flatten<{ [k in T]: k; }>;
type Literal = string | number | bigint | boolean | null | undefined;
type Primitive = string | number | symbol | bigint | boolean | null | undefined;
type HasLength = {
  length: number;
};
type Numeric = number | bigint | Date;
type PropValues = Record<string, Set<Primitive>>;
type PrimitiveSet = Set<Primitive>;
type EmptyToNever<T> = keyof T extends never ? never : T;
declare abstract class Class {
  constructor(..._args: any[]);
}
/** A trait's prototype members: a partial view of its own interface, with `this` typed as the instance. */
type ProtoOf<T> = { [K in keyof T]?: (T[K] extends ((...args: infer A) => infer R) ? (...args: A) => R : T[K]) | undefined; } & ThisType<T>;
//#endregion
//#region ../../node_modules/zod/v4/core/versions.d.cts
declare const version: {
  readonly major: 4;
  readonly minor: 6;
  readonly patch: number;
};
//#endregion
//#region ../../node_modules/zod/v4/core/schemas.d.cts
interface ParseContext<T extends $ZodIssueBase = never> {
  /** Customize error messages. */
  readonly error?: $ZodErrorMap<T>;
  /** Include the `input` field in issue objects. Default `false`. */
  readonly reportInput?: boolean;
  /** Skip eval-based fast path. Default `false`. */
  readonly jitless?: boolean;
}
/** @internal */
interface ParseContextInternal<T extends $ZodIssueBase = never> extends ParseContext<T> {
  readonly async?: boolean | undefined;
  readonly direction?: "forward" | "backward";
  readonly skipChecks?: boolean;
  /** Set only by `validate`/`validateAsync`. A container may stop before its next child, never inside one, so a map entry and a tuple's fixed items parse whole. */
  readonly abortEarly?: boolean;
}
interface ParsePayload<T = unknown> {
  value: T;
  issues: $ZodRawIssue[];
  /** A way to mark a whole payload as aborted. Used in codecs/pipes. */
  aborted?: boolean;
  /** @internal Set when the value came from a repeat visit to a node still being
   * parsed. Its checks run on the node itself, against the finished value. */
  memo?: boolean | undefined;
}
type CheckFn<T> = (input: ParsePayload<T>) => MaybeAsync<void>;
interface $ZodTypeDef {
  type: "string" | "number" | "int" | "boolean" | "bigint" | "symbol" | "null" | "undefined" | "void" | "never" | "any" | "unknown" | "date" | "object" | "record" | "file" | "array" | "tuple" | "union" | "intersection" | "map" | "set" | "enum" | "literal" | "nullable" | "optional" | "nonoptional" | "success" | "transform" | "default" | "prefault" | "catch" | "nan" | "pipe" | "readonly" | "template_literal" | "promise" | "lazy" | "function" | "custom";
  error?: $ZodErrorMap<never> | undefined;
  checks?: $ZodCheck<never>[];
}
interface _$ZodTypeInternals {
  /** The `@zod/core` version of this schema */
  version: typeof version;
  /** Schema definition. */
  def: $ZodTypeDef;
  /** @internal Randomly generated ID for this schema. */
  /** @internal List of deferred initializers. */
  deferred: AnyFunc[] | undefined;
  /** @internal Parses input and runs all checks (refinements). */
  run(payload: ParsePayload<any>, ctx: ParseContextInternal): MaybeAsync<ParsePayload>;
  /** @internal Parses input, doesn't run checks. */
  parse(payload: ParsePayload<any>, ctx: ParseContextInternal): MaybeAsync<ParsePayload>;
  /** @internal  Stores identifiers for the set of traits implemented by this schema. */
  traits: Set<string>;
  /** @internal Indicates that a schema output type should be considered optional inside objects.
   * @default Required
   */
  /** @internal Three rungs, each strictly stronger than the last:
   *   undefined    — required; the container may not omit this slot
   *   "optional"   — the container may omit it; nothing is supplied in its place
   *   "defaulted"  — the container may omit it AND this schema substitutes a value
   * Consumers asking "may the slot be absent?" test `!== undefined`.
   * $ZodOptional asks the stronger question and tests `=== "defaulted"`. */
  optin?: "optional" | "defaulted" | undefined;
  /** @internal */
  optout?: "optional" | undefined;
  /** @internal The set of literal values that will pass validation. Must be an exhaustive set. Used to determine optionality in z.record().
   *
   * Defined on: enum, const, literal, null, undefined
   * Passthrough: optional, nullable, branded, default, catch, pipe
   * Todo: unions?
   */
  values?: PrimitiveSet | undefined;
  /** Default value bubbled up from  */
  /** @internal A set of literal discriminators used for the fast path in discriminated unions. */
  propValues?: PropValues | undefined;
  /** @internal This flag indicates that a schema validation can be represented with a regular expression. Used to determine allowable schemas in z.templateLiteral(). */
  pattern: RegExp | undefined;
  /** @internal The constructor function of this schema. */
  constr: new (def: any) => $ZodType;
  /** @internal A catchall object for bag metadata related to this schema. Commonly modified by checks using `onattach`. */
  bag: Record<string, unknown>;
  /** @internal The set of issues this schema might throw during type checking. */
  isst: $ZodIssueBase;
  /** @internal Subject to change, not a public API. */
  processJSONSchema?: ((ctx: ToJSONSchemaContext, json: BaseSchema, params: ProcessParams) => void) | undefined;
  /** An optional method used to override `toJSONSchema` logic. */
  toJSONSchema?: () => unknown;
  /** @internal The parent of this schema. Only set during certain clone operations. */
  parent?: $ZodType | undefined;
}
/** @internal */
interface $ZodTypeInternals<out O = unknown, out I = unknown> extends _$ZodTypeInternals {
  /** @internal The inferred output type */
  output: O;
  /** @internal The inferred input type */
  input: I;
}
type $ZodStandardSchema<T> = StandardSchemaV1.Props<input<T>, output<T>>;
type SomeType = {
  _zod: _$ZodTypeInternals;
};
interface $ZodType<O = unknown, I = unknown, Internals extends $ZodTypeInternals<O, I> = $ZodTypeInternals<O, I>> {
  _zod: Internals;
  "~standard": $ZodStandardSchema<this>;
}
interface _$ZodType<T extends $ZodTypeInternals = $ZodTypeInternals> extends $ZodType<T["output"], T["input"], T> {}
declare const $ZodType: $constructor<$ZodType>;
interface $ZodStringDef extends $ZodTypeDef {
  type: "string";
  coerce?: boolean;
  checks?: $ZodCheck<string>[];
}
interface $ZodStringInternals<Input> extends $ZodTypeInternals<string, Input> {
  def: $ZodStringDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  isst: $ZodIssueInvalidType;
  bag: LoosePartial<{
    minimum: number;
    maximum: number;
    patterns: Set<RegExp>;
    format: string;
    contentEncoding: string;
    /** the pattern admits strings its `format` keyword forbids, so `toJSONSchema` must not emit it */
    laxFormat: boolean;
  }>;
}
interface $ZodString<Input = unknown> extends _$ZodType<$ZodStringInternals<Input>> {}
declare const $ZodString: $constructor<$ZodString>;
interface $ZodStringFormatDef<Format extends string = string> extends $ZodStringDef, $ZodCheckStringFormatDef<Format> {}
interface $ZodStringFormatInternals<Format extends string = string> extends $ZodStringInternals<string>, $ZodCheckStringFormatInternals {
  def: $ZodStringFormatDef<Format>;
}
interface $ZodStringFormat<Format extends string = string> extends $ZodType {
  _zod: $ZodStringFormatInternals<Format>;
}
declare const $ZodStringFormat: $constructor<$ZodStringFormat>;
interface $ZodGUIDInternals extends $ZodStringFormatInternals<"guid"> {}
interface $ZodGUID extends $ZodType {
  _zod: $ZodGUIDInternals;
}
declare const $ZodGUID: $constructor<$ZodGUID>;
interface $ZodUUIDDef extends $ZodStringFormatDef<"uuid"> {
  version?: "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7" | "v8";
}
interface $ZodUUIDInternals extends $ZodStringFormatInternals<"uuid"> {
  def: $ZodUUIDDef;
}
interface $ZodUUID extends $ZodType {
  _zod: $ZodUUIDInternals;
}
declare const $ZodUUID: $constructor<$ZodUUID>;
interface $ZodEmailInternals extends $ZodStringFormatInternals<"email"> {}
interface $ZodEmail extends $ZodType {
  _zod: $ZodEmailInternals;
}
declare const $ZodEmail: $constructor<$ZodEmail>;
interface $ZodURLDef extends $ZodStringFormatDef<"url"> {
  hostname?: RegExp | undefined;
  protocol?: RegExp | undefined;
  normalize?: boolean | undefined;
}
interface $ZodURLInternals extends $ZodStringFormatInternals<"url"> {
  def: $ZodURLDef;
}
interface $ZodURL extends $ZodType {
  _zod: $ZodURLInternals;
}
declare const $ZodURL: $constructor<$ZodURL>;
interface $ZodEmojiInternals extends $ZodStringFormatInternals<"emoji"> {}
interface $ZodEmoji extends $ZodType {
  _zod: $ZodEmojiInternals;
}
declare const $ZodEmoji: $constructor<$ZodEmoji>;
interface $ZodNanoIDDef extends $ZodStringFormatDef<"nanoid"> {
  length?: number | undefined;
}
interface $ZodNanoIDInternals extends $ZodStringFormatInternals<"nanoid"> {
  def: $ZodNanoIDDef;
}
interface $ZodNanoID extends $ZodType {
  _zod: $ZodNanoIDInternals;
}
declare const $ZodNanoID: $constructor<$ZodNanoID>;
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
interface $ZodCUIDInternals extends $ZodStringFormatInternals<"cuid"> {}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
interface $ZodCUID extends $ZodType {
  _zod: $ZodCUIDInternals;
}
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
declare const $ZodCUID: $constructor<$ZodCUID>;
interface $ZodCUID2Internals extends $ZodStringFormatInternals<"cuid2"> {}
interface $ZodCUID2 extends $ZodType {
  _zod: $ZodCUID2Internals;
}
declare const $ZodCUID2: $constructor<$ZodCUID2>;
interface $ZodULIDInternals extends $ZodStringFormatInternals<"ulid"> {}
interface $ZodULID extends $ZodType {
  _zod: $ZodULIDInternals;
}
declare const $ZodULID: $constructor<$ZodULID>;
interface $ZodXIDInternals extends $ZodStringFormatInternals<"xid"> {}
interface $ZodXID extends $ZodType {
  _zod: $ZodXIDInternals;
}
declare const $ZodXID: $constructor<$ZodXID>;
interface $ZodKSUIDInternals extends $ZodStringFormatInternals<"ksuid"> {}
interface $ZodKSUID extends $ZodType {
  _zod: $ZodKSUIDInternals;
}
declare const $ZodKSUID: $constructor<$ZodKSUID>;
interface $ZodISODateTimeDef extends $ZodStringFormatDef<"datetime"> {
  precision: number | null;
  offset: boolean;
  local: boolean;
}
interface $ZodISODateTimeInternals extends $ZodStringFormatInternals {
  def: $ZodISODateTimeDef;
}
interface $ZodISODateTime extends $ZodType {
  _zod: $ZodISODateTimeInternals;
}
declare const $ZodISODateTime: $constructor<$ZodISODateTime>;
interface $ZodISODateInternals extends $ZodStringFormatInternals<"date"> {}
interface $ZodISODate extends $ZodType {
  _zod: $ZodISODateInternals;
}
declare const $ZodISODate: $constructor<$ZodISODate>;
interface $ZodISOTimeDef extends $ZodStringFormatDef<"time"> {
  precision?: number | null;
}
interface $ZodISOTimeInternals extends $ZodStringFormatInternals<"time"> {
  def: $ZodISOTimeDef;
}
interface $ZodISOTime extends $ZodType {
  _zod: $ZodISOTimeInternals;
}
declare const $ZodISOTime: $constructor<$ZodISOTime>;
interface $ZodISODurationInternals extends $ZodStringFormatInternals<"duration"> {}
interface $ZodISODuration extends $ZodType {
  _zod: $ZodISODurationInternals;
}
declare const $ZodISODuration: $constructor<$ZodISODuration>;
interface $ZodIPv4Def extends $ZodStringFormatDef<"ipv4"> {
  version?: "v4";
}
interface $ZodIPv4Internals extends $ZodStringFormatInternals<"ipv4"> {
  def: $ZodIPv4Def;
}
interface $ZodIPv4 extends $ZodType {
  _zod: $ZodIPv4Internals;
}
declare const $ZodIPv4: $constructor<$ZodIPv4>;
interface $ZodIPv6Def extends $ZodStringFormatDef<"ipv6"> {
  version?: "v6";
}
interface $ZodIPv6Internals extends $ZodStringFormatInternals<"ipv6"> {
  def: $ZodIPv6Def;
}
interface $ZodIPv6 extends $ZodType {
  _zod: $ZodIPv6Internals;
}
declare const $ZodIPv6: $constructor<$ZodIPv6>;
interface $ZodCIDRv4Def extends $ZodStringFormatDef<"cidrv4"> {
  version?: "v4";
}
interface $ZodCIDRv4Internals extends $ZodStringFormatInternals<"cidrv4"> {
  def: $ZodCIDRv4Def;
}
interface $ZodCIDRv4 extends $ZodType {
  _zod: $ZodCIDRv4Internals;
}
declare const $ZodCIDRv4: $constructor<$ZodCIDRv4>;
interface $ZodCIDRv6Def extends $ZodStringFormatDef<"cidrv6"> {
  version?: "v6";
}
interface $ZodCIDRv6Internals extends $ZodStringFormatInternals<"cidrv6"> {
  def: $ZodCIDRv6Def;
}
interface $ZodCIDRv6 extends $ZodType {
  _zod: $ZodCIDRv6Internals;
}
declare const $ZodCIDRv6: $constructor<$ZodCIDRv6>;
interface $ZodBase64Internals extends $ZodStringFormatInternals<"base64"> {}
interface $ZodBase64 extends $ZodType {
  _zod: $ZodBase64Internals;
}
declare const $ZodBase64: $constructor<$ZodBase64>;
interface $ZodBase64URLInternals extends $ZodStringFormatInternals<"base64url"> {}
interface $ZodBase64URL extends $ZodType {
  _zod: $ZodBase64URLInternals;
}
declare const $ZodBase64URL: $constructor<$ZodBase64URL>;
interface $ZodE164Internals extends $ZodStringFormatInternals<"e164"> {}
interface $ZodE164 extends $ZodType {
  _zod: $ZodE164Internals;
}
declare const $ZodE164: $constructor<$ZodE164>;
interface $ZodJWTDef extends $ZodStringFormatDef<"jwt"> {
  alg?: JWTAlgorithm | undefined;
}
interface $ZodJWTInternals extends $ZodStringFormatInternals<"jwt"> {
  def: $ZodJWTDef;
}
interface $ZodJWT extends $ZodType {
  _zod: $ZodJWTInternals;
}
declare const $ZodJWT: $constructor<$ZodJWT>;
interface $ZodNumberDef extends $ZodTypeDef {
  type: "number";
  coerce?: boolean;
}
interface $ZodNumberInternals<Input = unknown> extends $ZodTypeInternals<number, Input> {
  def: $ZodNumberDef;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;
  /** @deprecated Internal API, use with caution (not deprecated) */
  isst: $ZodIssueInvalidType;
  bag: LoosePartial<{
    minimum: number;
    maximum: number;
    exclusiveMinimum: number;
    exclusiveMaximum: number;
    format: string;
    pattern: RegExp;
  }>;
}
interface $ZodNumber<Input = unknown> extends $ZodType {
  _zod: $ZodNumberInternals<Input>;
}
declare const $ZodNumber: $constructor<$ZodNumber>;
interface $ZodNumberFormatDef<Format extends $ZodNumberFormats = $ZodNumberFormats> extends $ZodNumberDef, $ZodCheckNumberFormatDef<Format> {}
interface $ZodNumberFormatInternals<Format extends $ZodNumberFormats = $ZodNumberFormats> extends $ZodNumberInternals<number>, $ZodCheckNumberFormatInternals<Format> {
  def: $ZodNumberFormatDef<Format>;
  isst: $ZodIssueInvalidType;
}
interface $ZodBooleanDef extends $ZodTypeDef {
  type: "boolean";
  coerce?: boolean;
  checks?: $ZodCheck<boolean>[];
}
interface $ZodBooleanInternals<T = unknown> extends $ZodTypeInternals<boolean, T> {
  pattern: RegExp;
  def: $ZodBooleanDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodBoolean<T = unknown> extends $ZodType {
  _zod: $ZodBooleanInternals<T>;
}
declare const $ZodBoolean: $constructor<$ZodBoolean>;
interface $ZodBigIntDef extends $ZodTypeDef {
  type: "bigint";
  coerce?: boolean;
}
interface $ZodBigIntInternals<T = unknown> extends $ZodTypeInternals<bigint, T> {
  pattern: RegExp;
  /** @internal Internal API, use with caution */
  def: $ZodBigIntDef;
  isst: $ZodIssueInvalidType;
  bag: LoosePartial<{
    minimum: bigint;
    maximum: bigint;
    format: string;
  }>;
}
interface $ZodBigInt<T = unknown> extends $ZodType {
  _zod: $ZodBigIntInternals<T>;
}
declare const $ZodBigInt: $constructor<$ZodBigInt>;
interface $ZodSymbolDef extends $ZodTypeDef {
  type: "symbol";
}
interface $ZodSymbolInternals extends $ZodTypeInternals<symbol, symbol> {
  def: $ZodSymbolDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodSymbol extends $ZodType {
  _zod: $ZodSymbolInternals;
}
declare const $ZodSymbol: $constructor<$ZodSymbol>;
interface $ZodUndefinedDef extends $ZodTypeDef {
  type: "undefined";
}
interface $ZodUndefinedInternals extends $ZodTypeInternals<undefined, undefined> {
  pattern: RegExp;
  def: $ZodUndefinedDef;
  values: PrimitiveSet;
  isst: $ZodIssueInvalidType;
}
interface $ZodUndefined extends $ZodType {
  _zod: $ZodUndefinedInternals;
}
declare const $ZodUndefined: $constructor<$ZodUndefined>;
interface $ZodNullDef extends $ZodTypeDef {
  type: "null";
}
interface $ZodNullInternals extends $ZodTypeInternals<null, null> {
  pattern: RegExp;
  def: $ZodNullDef;
  values: PrimitiveSet;
  isst: $ZodIssueInvalidType;
}
interface $ZodNull extends $ZodType {
  _zod: $ZodNullInternals;
}
declare const $ZodNull: $constructor<$ZodNull>;
interface $ZodAnyDef extends $ZodTypeDef {
  type: "any";
}
interface $ZodAnyInternals extends $ZodTypeInternals<any, any> {
  def: $ZodAnyDef;
  isst: never;
}
interface $ZodAny extends $ZodType {
  _zod: $ZodAnyInternals;
}
declare const $ZodAny: $constructor<$ZodAny>;
interface $ZodUnknownDef extends $ZodTypeDef {
  type: "unknown";
}
interface $ZodUnknownInternals extends $ZodTypeInternals<unknown, unknown> {
  def: $ZodUnknownDef;
  isst: never;
}
interface $ZodUnknown extends $ZodType {
  _zod: $ZodUnknownInternals;
}
declare const $ZodUnknown: $constructor<$ZodUnknown>;
interface $ZodNeverDef extends $ZodTypeDef {
  type: "never";
}
interface $ZodNeverInternals extends $ZodTypeInternals<never, never> {
  def: $ZodNeverDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodNever extends $ZodType {
  _zod: $ZodNeverInternals;
}
declare const $ZodNever: $constructor<$ZodNever>;
interface $ZodVoidDef extends $ZodTypeDef {
  type: "void";
}
interface $ZodVoidInternals extends $ZodTypeInternals<void, void> {
  def: $ZodVoidDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodVoid extends $ZodType {
  _zod: $ZodVoidInternals;
}
declare const $ZodVoid: $constructor<$ZodVoid>;
interface $ZodDateDef extends $ZodTypeDef {
  type: "date";
  coerce?: boolean;
}
interface $ZodDateInternals<T = unknown> extends $ZodTypeInternals<Date, T> {
  def: $ZodDateDef;
  isst: $ZodIssueInvalidType;
  bag: LoosePartial<{
    minimum: Date;
    maximum: Date;
    format: string;
  }>;
}
interface $ZodDate<T = unknown> extends $ZodType {
  _zod: $ZodDateInternals<T>;
}
declare const $ZodDate: $constructor<$ZodDate>;
interface $ZodArrayDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "array";
  element: T;
}
interface $ZodArrayInternals<T extends SomeType = $ZodType> extends _$ZodTypeInternals {
  def: $ZodArrayDef<T>;
  isst: $ZodIssueInvalidType;
  output: output<T>[];
  input: input<T>[];
}
interface $ZodArray<T extends SomeType = $ZodType> extends $ZodType<any, any, $ZodArrayInternals<T>> {}
declare const $ZodArray: $constructor<$ZodArray>;
type OptionalOutSchema = {
  _zod: {
    optout: "optional";
  };
};
type OptionalInSchema = {
  _zod: {
    optin: "optional" | "defaulted";
  };
};
type $InferObjectOutput<T extends $ZodLooseShape, Extra extends Record<string, unknown>> = string extends keyof T ? IsAny<T[keyof T]> extends true ? Record<string, unknown> : { [k in string]: output<T[keyof T]>; } : keyof (T & Extra) extends never ? Record<string, never> : Prettify<{ -readonly [k in keyof T as T[k] extends OptionalOutSchema ? never : k]: T[k]["_zod"]["output"]; } & { -readonly [k in keyof T as T[k] extends OptionalOutSchema ? k : never]?: T[k]["_zod"]["output"]; } & Extra>;
type $InferObjectInput<T extends $ZodLooseShape, Extra extends Record<string, unknown>> = string extends keyof T ? IsAny<T[keyof T]> extends true ? Record<string, unknown> : { [k in string]: input<T[keyof T]>; } : keyof (T & Extra) extends never ? Record<string, never> : Prettify<{ -readonly [k in keyof T as T[k] extends OptionalInSchema ? never : k]: T[k]["_zod"]["input"]; } & { -readonly [k in keyof T as T[k] extends OptionalInSchema ? k : never]?: T[k]["_zod"]["input"]; } & Extra>;
type $ZodObjectConfig = {
  out: Record<string, unknown>;
  in: Record<string, unknown>;
};
type $loose = {
  out: Record<string, unknown>;
  in: Record<string, unknown>;
};
type $strict = {
  out: {};
  in: {};
};
type $strip = {
  out: {};
  in: {};
};
type $catchall<T extends SomeType> = {
  out: {
    [k: string]: output<T>;
  };
  in: {
    [k: string]: input<T>;
  };
};
type $ZodShape = Readonly<{
  [k: string]: $ZodType;
}>;
interface $ZodObjectDef<Shape extends $ZodShape = $ZodShape> extends $ZodTypeDef {
  type: "object";
  shape: Shape;
  catchall?: $ZodType | undefined;
}
interface $ZodObjectInternals<
/** @ts-ignore Cast variance */
out Shape extends $ZodShape = $ZodShape, out Config extends $ZodObjectConfig = $ZodObjectConfig> extends _$ZodTypeInternals {
  def: $ZodObjectDef<Shape>;
  config: Config;
  isst: $ZodIssueInvalidType | $ZodIssueUnrecognizedKeys;
  propValues: PropValues;
  output: $InferObjectOutput<Shape, Config["out"]>;
  input: $InferObjectInput<Shape, Config["in"]>;
  optin?: "optional" | undefined;
  optout?: "optional" | undefined;
}
type $ZodLooseShape = Record<string, any>;
interface $ZodObject<
/** @ts-ignore Cast variance */
out Shape extends Readonly<$ZodShape> = Readonly<$ZodShape>, out Params extends $ZodObjectConfig = $ZodObjectConfig> extends $ZodType<any, any, $ZodObjectInternals<Shape, Params>> {}
declare const $ZodObject: $constructor<$ZodObject>;
type $InferUnionOutput<T extends SomeType> = T extends any ? output<T> : never;
type $InferUnionInput<T extends SomeType> = T extends any ? input<T> : never;
interface $ZodUnionDef<Options extends readonly SomeType[] = readonly $ZodType[]> extends $ZodTypeDef {
  type: "union";
  options: Options;
  inclusive?: boolean;
}
type IsOptionalIn<T extends SomeType> = T extends OptionalInSchema ? true : false;
type IsOptionalOut<T extends SomeType> = T extends OptionalOutSchema ? true : false;
interface $ZodUnionInternals<T extends readonly SomeType[] = readonly $ZodType[]> extends _$ZodTypeInternals {
  def: $ZodUnionDef<T>;
  isst: $ZodIssueInvalidUnion;
  pattern: T[number]["_zod"]["pattern"];
  values: T[number]["_zod"]["values"];
  output: $InferUnionOutput<T[number]>;
  input: $InferUnionInput<T[number]>;
  optin: IsOptionalIn<T[number]> extends false ? "optional" | "defaulted" | undefined : "optional" | "defaulted";
  optout: IsOptionalOut<T[number]> extends false ? "optional" | undefined : "optional";
}
interface $ZodUnion<T extends readonly SomeType[] = readonly $ZodType[]> extends $ZodType<any, any, $ZodUnionInternals<T>> {
  _zod: $ZodUnionInternals<T>;
}
declare const $ZodUnion: $constructor<$ZodUnion>;
interface $ZodIntersectionDef<Left extends SomeType = $ZodType, Right extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "intersection";
  left: Left;
  right: Right;
}
interface $ZodIntersectionInternals<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends _$ZodTypeInternals {
  def: $ZodIntersectionDef<A, B>;
  isst: never;
  optin: A["_zod"]["optin"] | B["_zod"]["optin"];
  optout: A["_zod"]["optout"] | B["_zod"]["optout"];
  output: output<A> & output<B>;
  input: input<A> & input<B>;
}
interface $ZodIntersection<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodIntersectionInternals<A, B>;
}
declare const $ZodIntersection: $constructor<$ZodIntersection>;
interface $ZodTupleDef<T extends TupleItems = readonly $ZodType[], Rest extends SomeType | null = $ZodType | null> extends $ZodTypeDef {
  type: "tuple";
  items: T;
  rest: Rest;
}
type $InferTupleInputType<T extends TupleItems, Rest extends SomeType | null> = [...TupleInputTypeWithOptionals<T>, ...(Rest extends SomeType ? input<Rest>[] : [])];
type TupleInputTypeNoOptionals<T extends TupleItems> = { [k in keyof T]: input<T[k]>; };
type TupleInputTypeWithOptionals<T extends TupleItems> = T extends readonly [...infer Prefix extends SomeType[], infer Tail extends SomeType] ? Tail["_zod"]["optin"] extends "optional" | "defaulted" ? [...TupleInputTypeWithOptionals<Prefix>, input<Tail>?] : TupleInputTypeNoOptionals<T> : [];
type $InferTupleOutputType<T extends TupleItems, Rest extends SomeType | null> = [...TupleOutputTypeWithOptionals<T>, ...(Rest extends SomeType ? output<Rest>[] : [])];
type TupleOutputTypeNoOptionals<T extends TupleItems> = { [k in keyof T]: output<T[k]>; };
type TupleOutputTypeWithOptionals<T extends TupleItems> = T extends readonly [...infer Prefix extends SomeType[], infer Tail extends SomeType] ? Tail["_zod"]["optout"] extends "optional" ? [...TupleOutputTypeWithOptionals<Prefix>, output<Tail>?] : TupleOutputTypeNoOptionals<T> : [];
interface $ZodTupleInternals<T extends TupleItems = readonly $ZodType[], Rest extends SomeType | null = $ZodType | null> extends _$ZodTypeInternals {
  def: $ZodTupleDef<T, Rest>;
  isst: $ZodIssueInvalidType | $ZodIssueTooBig<unknown[]> | $ZodIssueTooSmall<unknown[]>;
  output: $InferTupleOutputType<T, Rest>;
  input: $InferTupleInputType<T, Rest>;
}
interface $ZodTuple<T extends TupleItems = readonly $ZodType[], Rest extends SomeType | null = $ZodType | null> extends $ZodType {
  _zod: $ZodTupleInternals<T, Rest>;
}
declare const $ZodTuple: $constructor<$ZodTuple>;
type $ZodRecordKey = $ZodType<string | number | symbol, unknown>;
interface $ZodRecordDef<Key extends $ZodRecordKey = $ZodRecordKey, Value extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "record";
  keyType: Key;
  valueType: Value;
  /** @default "strict" - errors on keys not matching keyType. "loose" passes through non-matching keys unchanged. */
  mode?: "strict" | "loose";
  partial?: boolean;
}
type $InferZodRecordOutput<Key extends $ZodRecordKey = $ZodRecordKey, Value extends SomeType = $ZodType> = Key extends $partial ? Partial<Record<output<Key>, output<Value>>> : Record<output<Key>, output<Value>>;
type $InferZodRecordInput<Key extends $ZodRecordKey = $ZodRecordKey, Value extends SomeType = $ZodType> = Key extends $partial ? Partial<Record<input<Key> & PropertyKey, input<Value>>> : [Value] extends [OptionalInSchema] ? Partial<Record<input<Key> & PropertyKey, input<Value>>> : Record<input<Key> & PropertyKey, input<Value>>;
interface $ZodRecordInternals<Key extends $ZodRecordKey = $ZodRecordKey, Value extends SomeType = $ZodType> extends $ZodTypeInternals<$InferZodRecordOutput<Key, Value>, $InferZodRecordInput<Key, Value>> {
  def: $ZodRecordDef<Key, Value>;
  isst: $ZodIssueInvalidType | $ZodIssueInvalidKey<Record<PropertyKey, unknown>>;
  optin?: "optional" | undefined;
  optout?: "optional" | undefined;
}
type $partial = {
  "~~partial": true;
};
interface $ZodRecord<Key extends $ZodRecordKey = $ZodRecordKey, Value extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodRecordInternals<Key, Value>;
}
declare const $ZodRecord: $constructor<$ZodRecord>;
interface $ZodMapDef<Key extends SomeType = $ZodType, Value extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "map";
  keyType: Key;
  valueType: Value;
}
interface $ZodMapInternals<Key extends SomeType = $ZodType, Value extends SomeType = $ZodType> extends $ZodTypeInternals<Map<output<Key>, output<Value>>, Map<input<Key>, input<Value>>> {
  def: $ZodMapDef<Key, Value>;
  isst: $ZodIssueInvalidType | $ZodIssueInvalidKey | $ZodIssueInvalidElement<unknown>;
  optin?: "optional" | undefined;
  optout?: "optional" | undefined;
}
interface $ZodMap<Key extends SomeType = $ZodType, Value extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodMapInternals<Key, Value>;
}
declare const $ZodMap: $constructor<$ZodMap>;
interface $ZodSetDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "set";
  valueType: T;
}
interface $ZodSetInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<Set<output<T>>, Set<input<T>>> {
  def: $ZodSetDef<T>;
  isst: $ZodIssueInvalidType;
  optin?: "optional" | undefined;
  optout?: "optional" | undefined;
}
interface $ZodSet<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodSetInternals<T>;
}
declare const $ZodSet: $constructor<$ZodSet>;
type $InferEnumOutput<T extends EnumLike> = T[keyof T] & {};
type $InferEnumInput<T extends EnumLike> = T[keyof T] & {};
interface $ZodEnumDef<T extends EnumLike = EnumLike> extends $ZodTypeDef {
  type: "enum";
  entries: T;
}
interface $ZodEnumInternals<
/** @ts-ignore Cast variance */
out T extends EnumLike = EnumLike> extends $ZodTypeInternals<$InferEnumOutput<T>, $InferEnumInput<T>> {
  def: $ZodEnumDef<T>;
  /** @deprecated Internal API, use with caution (not deprecated) */
  values: PrimitiveSet;
  /** @deprecated Internal API, use with caution (not deprecated) */
  pattern: RegExp;
  isst: $ZodIssueInvalidValue;
}
interface $ZodEnum<T extends EnumLike = EnumLike> extends $ZodType {
  _zod: $ZodEnumInternals<T>;
}
declare const $ZodEnum: $constructor<$ZodEnum>;
interface $ZodLiteralDef<T extends Literal> extends $ZodTypeDef {
  type: "literal";
  values: T[];
}
interface $ZodLiteralInternals<T extends Literal = Literal> extends $ZodTypeInternals<T, T> {
  def: $ZodLiteralDef<T>;
  values: Set<T>;
  pattern: RegExp;
  isst: $ZodIssueInvalidValue;
}
interface $ZodLiteral<T extends Literal = Literal> extends $ZodType {
  _zod: $ZodLiteralInternals<T>;
}
declare const $ZodLiteral: $constructor<$ZodLiteral>;
/** Do not reference this directly. */
interface File$1 extends _File {
  readonly type: string;
  readonly size: number;
}
interface $ZodFileDef extends $ZodTypeDef {
  type: "file";
}
interface $ZodFileInternals extends $ZodTypeInternals<File$1, File$1> {
  def: $ZodFileDef;
  isst: $ZodIssueInvalidType;
  bag: LoosePartial<{
    minimum: number;
    maximum: number;
    mime: MimeTypes[];
  }>;
}
interface $ZodFile extends $ZodType {
  _zod: $ZodFileInternals;
}
declare const $ZodFile: $constructor<$ZodFile>;
interface $ZodTransformDef extends $ZodTypeDef {
  type: "transform";
  transform: (input: unknown, payload: ParsePayload<unknown>) => MaybeAsync<unknown>;
}
interface $ZodTransformInternals<O = unknown, I = unknown> extends $ZodTypeInternals<O, I> {
  def: $ZodTransformDef;
  isst: never;
}
interface $ZodTransform<O = unknown, I = unknown> extends $ZodType {
  _zod: $ZodTransformInternals<O, I>;
}
declare const $ZodTransform: $constructor<$ZodTransform>;
interface $ZodOptionalDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "optional";
  innerType: T;
}
interface $ZodOptionalInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<output<T> | undefined, input<T> | undefined> {
  def: $ZodOptionalDef<T>;
  optin: "optional" | "defaulted";
  optout: "optional";
  isst: never;
  values: T["_zod"]["values"];
  pattern: T["_zod"]["pattern"];
}
interface $ZodOptional<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodOptionalInternals<T>;
}
declare const $ZodOptional: $constructor<$ZodOptional>;
interface $ZodExactOptionalDef<T extends SomeType = $ZodType> extends $ZodOptionalDef<T> {}
interface $ZodExactOptionalInternals<T extends SomeType = $ZodType> extends $ZodOptionalInternals<T> {
  def: $ZodExactOptionalDef<T>;
  output: output<T>;
  input: input<T>;
}
interface $ZodExactOptional<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodExactOptionalInternals<T>;
}
declare const $ZodExactOptional: $constructor<$ZodExactOptional>;
interface $ZodNullableDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "nullable";
  innerType: T;
}
interface $ZodNullableInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<output<T> | null, input<T> | null> {
  def: $ZodNullableDef<T>;
  optin: T["_zod"]["optin"];
  optout: T["_zod"]["optout"];
  isst: never;
  values: T["_zod"]["values"];
  pattern: T["_zod"]["pattern"];
}
interface $ZodNullable<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodNullableInternals<T>;
}
declare const $ZodNullable: $constructor<$ZodNullable>;
interface $ZodDefaultDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "default";
  innerType: T;
  /** The default value. May be a getter. */
  defaultValue: NoUndefined<output<T>>;
}
interface $ZodDefaultInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<NoUndefined<output<T>>, input<T> | undefined> {
  def: $ZodDefaultDef<T>;
  optin: "defaulted";
  optout?: "optional" | undefined;
  isst: never;
  values: T["_zod"]["values"];
}
interface $ZodDefault<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodDefaultInternals<T>;
}
declare const $ZodDefault: $constructor<$ZodDefault>;
interface $ZodPrefaultDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "prefault";
  innerType: T;
  /** The default value. May be a getter. */
  defaultValue: input<T>;
}
interface $ZodPrefaultInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<output<T>, input<T> | undefined> {
  def: $ZodPrefaultDef<T>;
  optin: "defaulted";
  optout?: "optional" | undefined;
  isst: never;
  values: T["_zod"]["values"];
}
interface $ZodPrefault<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodPrefaultInternals<T>;
}
declare const $ZodPrefault: $constructor<$ZodPrefault>;
interface $ZodNonOptionalDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "nonoptional";
  innerType: T;
}
interface $ZodNonOptionalInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<NoUndefined<output<T>>, NoUndefined<input<T>>> {
  def: $ZodNonOptionalDef<T>;
  isst: $ZodIssueInvalidType;
  values: T["_zod"]["values"];
  optin: "optional" | undefined;
  optout: "optional" | undefined;
}
interface $ZodNonOptional<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodNonOptionalInternals<T>;
}
declare const $ZodNonOptional: $constructor<$ZodNonOptional>;
interface $ZodSuccessDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "success";
  innerType: T;
}
interface $ZodSuccessInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<boolean, input<T>> {
  def: $ZodSuccessDef<T>;
  isst: never;
  optin: T["_zod"]["optin"];
  optout: "optional" | undefined;
}
interface $ZodSuccess<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodSuccessInternals<T>;
}
declare const $ZodSuccess: $constructor<$ZodSuccess>;
interface $ZodCatchCtx extends ParsePayload {
  /** @deprecated Use `ctx.issues` */
  error: {
    issues: $ZodIssue[];
  };
  /** @deprecated Use `ctx.value` */
  input: unknown;
}
interface $ZodCatchDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "catch";
  innerType: T;
  catchValue: (ctx: $ZodCatchCtx) => unknown;
}
interface $ZodCatchInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<output<T>, input<T>> {
  def: $ZodCatchDef<T>;
  optin: T["_zod"]["optin"];
  optout: T["_zod"]["optout"];
  isst: never;
  values: T["_zod"]["values"];
}
interface $ZodCatch<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodCatchInternals<T>;
}
declare const $ZodCatch: $constructor<$ZodCatch>;
interface $ZodNaNDef extends $ZodTypeDef {
  type: "nan";
}
interface $ZodNaNInternals extends $ZodTypeInternals<number, number> {
  def: $ZodNaNDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodNaN extends $ZodType {
  _zod: $ZodNaNInternals;
}
declare const $ZodNaN: $constructor<$ZodNaN>;
interface $ZodPipeDef<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "pipe";
  in: A;
  out: B;
  /** Only defined inside $ZodCodec instances. */
  transform?: (value: output<A>, payload: ParsePayload<output<A>>) => MaybeAsync<input<B>>;
  /** Only defined inside $ZodCodec instances. */
  reverseTransform?: (value: input<B>, payload: ParsePayload<input<B>>) => MaybeAsync<output<A>>;
}
interface $ZodPipeInternals<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends $ZodTypeInternals<output<B>, input<A>> {
  def: $ZodPipeDef<A, B>;
  isst: never;
  values: A["_zod"]["values"];
  optin: A["_zod"]["optin"];
  optout: B["_zod"]["optout"];
  propValues: A["_zod"]["propValues"];
}
interface $ZodPipe<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodPipeInternals<A, B>;
}
declare const $ZodPipe: $constructor<$ZodPipe>;
interface $ZodReadonlyDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "readonly";
  innerType: T;
}
interface $ZodReadonlyInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<MakeReadonly<output<T>>, MakeReadonly<input<T>>> {
  def: $ZodReadonlyDef<T>;
  optin: T["_zod"]["optin"];
  optout: T["_zod"]["optout"];
  isst: never;
  propValues: T["_zod"]["propValues"];
  values: T["_zod"]["values"];
}
interface $ZodReadonly<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodReadonlyInternals<T>;
}
declare const $ZodReadonly: $constructor<$ZodReadonly>;
interface $ZodTemplateLiteralDef extends $ZodTypeDef {
  type: "template_literal";
  parts: $ZodTemplateLiteralPart[];
  format?: string | undefined;
}
interface $ZodTemplateLiteralInternals<Template extends string = string> extends $ZodTypeInternals<Template, Template> {
  pattern: RegExp;
  def: $ZodTemplateLiteralDef;
  isst: $ZodIssueInvalidType;
}
interface $ZodTemplateLiteral<Template extends string = string> extends $ZodType {
  _zod: $ZodTemplateLiteralInternals<Template>;
}
type LiteralPart = Exclude<Literal, symbol>;
interface SchemaPartInternals extends $ZodTypeInternals<LiteralPart, LiteralPart> {
  pattern: RegExp;
}
interface SchemaPart extends $ZodType {
  _zod: SchemaPartInternals;
}
type $ZodTemplateLiteralPart = LiteralPart | SchemaPart;
declare const $ZodTemplateLiteral: $constructor<$ZodTemplateLiteral>;
type $ZodFunctionArgs = $ZodType<unknown[], unknown[]>;
type $ZodFunctionIn = $ZodFunctionArgs;
type $ZodFunctionOut = $ZodType;
type $InferInnerFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (...args: $ZodFunctionIn extends Args ? never[] : output<Args>) => input<Returns>;
type $InferInnerFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (...args: $ZodFunctionIn extends Args ? never[] : output<Args>) => MaybeAsync<input<Returns>>;
type $InferOuterFunctionType<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (...args: $ZodFunctionIn extends Args ? never[] : input<Args>) => output<Returns>;
type $InferOuterFunctionTypeAsync<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> = (...args: $ZodFunctionIn extends Args ? never[] : input<Args>) => Promise<output<Returns>>;
interface $ZodFunctionDef<In extends $ZodFunctionIn = $ZodFunctionIn, Out extends $ZodFunctionOut = $ZodFunctionOut> extends $ZodTypeDef {
  type: "function";
  input: In;
  output: Out;
}
interface $ZodFunctionInternals<Args extends $ZodFunctionIn, Returns extends $ZodFunctionOut> extends $ZodTypeInternals<$InferOuterFunctionType<Args, Returns>, $InferInnerFunctionType<Args, Returns>> {
  def: $ZodFunctionDef<Args, Returns>;
  isst: $ZodIssueInvalidType;
}
interface $ZodFunction<Args extends $ZodFunctionIn = $ZodFunctionIn, Returns extends $ZodFunctionOut = $ZodFunctionOut> extends $ZodType<any, any, $ZodFunctionInternals<Args, Returns>> {
  /** @deprecated */
  _def: $ZodFunctionDef<Args, Returns>;
  _input: $InferInnerFunctionType<Args, Returns>;
  _output: $InferOuterFunctionType<Args, Returns>;
  implement<F extends $InferInnerFunctionType<Args, Returns>>(func: F): (...args: Parameters<this["_output"]>) => ReturnType<F> extends ReturnType<this["_output"]> ? ReturnType<F> : ReturnType<this["_output"]>;
  implementAsync<F extends $InferInnerFunctionTypeAsync<Args, Returns>>(func: F): F extends $InferOuterFunctionTypeAsync<Args, Returns> ? F : $InferOuterFunctionTypeAsync<Args, Returns>;
  input<const Items extends TupleItems, const Rest extends $ZodFunctionOut = $ZodFunctionOut>(args: Items, rest?: Rest): $ZodFunction<$ZodTuple<Items, Rest>, Returns>;
  input<NewArgs extends $ZodFunctionIn>(args: NewArgs): $ZodFunction<NewArgs, Returns>;
  input(...args: any[]): $ZodFunction<any, Returns>;
  output<NewReturns extends $ZodType>(output: NewReturns): $ZodFunction<Args, NewReturns>;
}
declare const $ZodFunction: $constructor<$ZodFunction>;
interface $ZodPromiseDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "promise";
  innerType: T;
}
interface $ZodPromiseInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<Promise<output<T>>, MaybeAsync<input<T>>> {
  def: $ZodPromiseDef<T>;
  isst: never;
}
interface $ZodPromise<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodPromiseInternals<T>;
}
declare const $ZodPromise: $constructor<$ZodPromise>;
interface $ZodLazyDef<T extends SomeType = $ZodType> extends $ZodTypeDef {
  type: "lazy";
  getter: () => T;
}
interface $ZodLazyInternals<T extends SomeType = $ZodType> extends $ZodTypeInternals<output<T>, input<T>> {
  def: $ZodLazyDef<T>;
  isst: never;
  /** Auto-cached way to retrieve the inner schema */
  innerType: T;
  pattern: T["_zod"]["pattern"];
  propValues: T["_zod"]["propValues"];
  optin: T["_zod"]["optin"];
  optout: T["_zod"]["optout"];
}
interface $ZodLazy<T extends SomeType = $ZodType> extends $ZodType {
  _zod: $ZodLazyInternals<T>;
}
declare const $ZodLazy: $constructor<$ZodLazy>;
interface $ZodCustomDef<O = unknown> extends $ZodTypeDef, $ZodCheckDef {
  type: "custom";
  check: "custom";
  path?: PropertyKey[] | undefined;
  error?: $ZodErrorMap | undefined;
  params?: Record<string, any> | undefined;
  fn: (arg: O) => unknown;
}
interface $ZodCustomInternals<O = unknown, I = unknown> extends $ZodTypeInternals<O, I>, $ZodCheckInternals<O> {
  def: $ZodCustomDef;
  issc: $ZodIssue;
  isst: never;
  bag: LoosePartial<{
    Class: typeof Class;
  }>;
}
interface $ZodCustom<O = unknown, I = unknown> extends $ZodType {
  _zod: $ZodCustomInternals<O, I>;
}
declare const $ZodCustom: $constructor<$ZodCustom>;
type $ZodTypes = $ZodString | $ZodNumber | $ZodBigInt | $ZodBoolean | $ZodDate | $ZodSymbol | $ZodUndefined | $ZodNullable | $ZodNull | $ZodAny | $ZodUnknown | $ZodNever | $ZodVoid | $ZodArray | $ZodObject | $ZodUnion | $ZodIntersection | $ZodTuple | $ZodRecord | $ZodMap | $ZodSet | $ZodLiteral | $ZodEnum | $ZodFunction | $ZodPromise | $ZodLazy | $ZodOptional | $ZodDefault | $ZodPrefault | $ZodTemplateLiteral | $ZodCustom | $ZodTransform | $ZodNonOptional | $ZodReadonly | $ZodNaN | $ZodPipe | $ZodSuccess | $ZodCatch | $ZodFile;
//#endregion
//#region ../../node_modules/zod/v4/core/checks.d.cts
interface $ZodCheckDef {
  check: string;
  error?: $ZodErrorMap<never> | undefined;
  /** If true, no later checks will be executed if this check fails. Default `false`. */
  abort?: boolean | undefined;
  /** If provided, the check runs only when this returns `true`. By default, it is skipped if prior parsing produced aborting issues. */
  when?: ((payload: ParsePayload) => boolean) | undefined;
}
interface $ZodCheckInternals<T> {
  def: $ZodCheckDef;
  /** The set of issues this check might throw. */
  issc?: $ZodIssueBase;
  check(payload: ParsePayload<T>): MaybeAsync<void>;
  onattach: ((schema: $ZodType) => void)[];
}
interface $ZodCheck<in T = never> {
  _zod: $ZodCheckInternals<T>;
}
declare const $ZodCheck: $constructor<$ZodCheck<any>>;
interface $ZodCheckLessThanDef extends $ZodCheckDef {
  check: "less_than";
  value: Numeric;
  inclusive: boolean;
}
interface $ZodCheckLessThanInternals<T extends Numeric = Numeric> extends $ZodCheckInternals<T> {
  def: $ZodCheckLessThanDef;
  issc: $ZodIssueTooBig<T>;
}
interface $ZodCheckLessThan<T extends Numeric = Numeric> extends $ZodCheck<T> {
  _zod: $ZodCheckLessThanInternals<T>;
}
declare const $ZodCheckLessThan: $constructor<$ZodCheckLessThan>;
interface $ZodCheckGreaterThanDef extends $ZodCheckDef {
  check: "greater_than";
  value: Numeric;
  inclusive: boolean;
}
interface $ZodCheckGreaterThanInternals<T extends Numeric = Numeric> extends $ZodCheckInternals<T> {
  def: $ZodCheckGreaterThanDef;
  issc: $ZodIssueTooSmall<T>;
}
interface $ZodCheckGreaterThan<T extends Numeric = Numeric> extends $ZodCheck<T> {
  _zod: $ZodCheckGreaterThanInternals<T>;
}
declare const $ZodCheckGreaterThan: $constructor<$ZodCheckGreaterThan>;
interface $ZodCheckMultipleOfDef<T extends number | bigint = number | bigint> extends $ZodCheckDef {
  check: "multiple_of";
  value: T;
}
interface $ZodCheckMultipleOfInternals<T extends number | bigint = number | bigint> extends $ZodCheckInternals<T> {
  def: $ZodCheckMultipleOfDef<T>;
  issc: $ZodIssueNotMultipleOf;
}
interface $ZodCheckMultipleOf<T extends number | bigint = number | bigint> extends $ZodCheck<T> {
  _zod: $ZodCheckMultipleOfInternals<T>;
}
declare const $ZodCheckMultipleOf: $constructor<$ZodCheckMultipleOf<number | bigint>>;
type $ZodNumberFormats = "int32" | "uint32" | "float32" | "float64" | "safeint";
interface $ZodCheckNumberFormatDef<Format extends $ZodNumberFormats = $ZodNumberFormats> extends $ZodCheckDef {
  check: "number_format";
  format: Format;
}
interface $ZodCheckNumberFormatInternals<Format extends $ZodNumberFormats = $ZodNumberFormats> extends $ZodCheckInternals<number> {
  def: $ZodCheckNumberFormatDef<Format>;
  issc: $ZodIssueInvalidType | $ZodIssueTooBig<"number"> | $ZodIssueTooSmall<"number">;
}
interface $ZodCheckNumberFormat<Format extends $ZodNumberFormats = $ZodNumberFormats> extends $ZodCheck<number> {
  _zod: $ZodCheckNumberFormatInternals<Format>;
}
declare const $ZodCheckNumberFormat: $constructor<$ZodCheckNumberFormat>;
interface $ZodCheckMaxLengthDef extends $ZodCheckDef {
  check: "max_length";
  maximum: number;
}
interface $ZodCheckMaxLengthInternals<T extends HasLength = HasLength> extends $ZodCheckInternals<T> {
  def: $ZodCheckMaxLengthDef;
  issc: $ZodIssueTooBig<T>;
}
interface $ZodCheckMaxLength<T extends HasLength = HasLength> extends $ZodCheck<T> {
  _zod: $ZodCheckMaxLengthInternals<T>;
}
declare const $ZodCheckMaxLength: $constructor<$ZodCheckMaxLength>;
interface $ZodCheckMinLengthDef extends $ZodCheckDef {
  check: "min_length";
  minimum: number;
}
interface $ZodCheckMinLengthInternals<T extends HasLength = HasLength> extends $ZodCheckInternals<T> {
  def: $ZodCheckMinLengthDef;
  issc: $ZodIssueTooSmall<T>;
}
interface $ZodCheckMinLength<T extends HasLength = HasLength> extends $ZodCheck<T> {
  _zod: $ZodCheckMinLengthInternals<T>;
}
declare const $ZodCheckMinLength: $constructor<$ZodCheckMinLength>;
interface $ZodCheckLengthEqualsDef extends $ZodCheckDef {
  check: "length_equals";
  length: number;
}
interface $ZodCheckLengthEqualsInternals<T extends HasLength = HasLength> extends $ZodCheckInternals<T> {
  def: $ZodCheckLengthEqualsDef;
  issc: $ZodIssueTooBig<T> | $ZodIssueTooSmall<T>;
}
interface $ZodCheckLengthEquals<T extends HasLength = HasLength> extends $ZodCheck<T> {
  _zod: $ZodCheckLengthEqualsInternals<T>;
}
declare const $ZodCheckLengthEquals: $constructor<$ZodCheckLengthEquals>;
type $ZodStringFormats = "email" | "url" | "emoji" | "uuid" | "guid" | "nanoid" | "cuid" | "cuid2" | "ulid" | "xid" | "ksuid" | "datetime" | "date" | "time" | "duration" | "ipv4" | "ipv6" | "cidrv4" | "cidrv6" | "base64" | "base64url" | "json_string" | "e164" | "credit_card" | "iban" | "lowercase" | "uppercase" | "regex" | "jwt" | "starts_with" | "ends_with" | "includes";
interface $ZodCheckStringFormatDef<Format extends string = string> extends $ZodCheckDef {
  check: "string_format";
  format: Format;
  pattern?: RegExp | undefined;
}
interface $ZodCheckStringFormatInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckStringFormatDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckRegexDef extends $ZodCheckStringFormatDef {
  format: "regex";
  pattern: RegExp;
}
interface $ZodCheckRegexInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckRegexDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckRegex extends $ZodCheck<string> {
  _zod: $ZodCheckRegexInternals;
}
declare const $ZodCheckRegex: $constructor<$ZodCheckRegex>;
interface $ZodCheckLowerCaseDef extends $ZodCheckStringFormatDef<"lowercase"> {}
interface $ZodCheckLowerCaseInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckLowerCaseDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckLowerCase extends $ZodCheck<string> {
  _zod: $ZodCheckLowerCaseInternals;
}
declare const $ZodCheckLowerCase: $constructor<$ZodCheckLowerCase>;
interface $ZodCheckUpperCaseDef extends $ZodCheckStringFormatDef<"uppercase"> {}
interface $ZodCheckUpperCaseInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckUpperCaseDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckUpperCase extends $ZodCheck<string> {
  _zod: $ZodCheckUpperCaseInternals;
}
declare const $ZodCheckUpperCase: $constructor<$ZodCheckUpperCase>;
interface $ZodCheckIncludesDef extends $ZodCheckStringFormatDef<"includes"> {
  includes: string;
  position?: number | undefined;
}
interface $ZodCheckIncludesInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckIncludesDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckIncludes extends $ZodCheck<string> {
  _zod: $ZodCheckIncludesInternals;
}
declare const $ZodCheckIncludes: $constructor<$ZodCheckIncludes>;
interface $ZodCheckStartsWithDef extends $ZodCheckStringFormatDef<"starts_with"> {
  prefix: string;
}
interface $ZodCheckStartsWithInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckStartsWithDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckStartsWith extends $ZodCheck<string> {
  _zod: $ZodCheckStartsWithInternals;
}
declare const $ZodCheckStartsWith: $constructor<$ZodCheckStartsWith>;
interface $ZodCheckEndsWithDef extends $ZodCheckStringFormatDef<"ends_with"> {
  suffix: string;
}
interface $ZodCheckEndsWithInternals extends $ZodCheckInternals<string> {
  def: $ZodCheckEndsWithDef;
  issc: $ZodIssueInvalidStringFormat;
}
interface $ZodCheckEndsWith extends $ZodCheckInternals<string> {
  _zod: $ZodCheckEndsWithInternals;
}
declare const $ZodCheckEndsWith: $constructor<$ZodCheckEndsWith>;
//#endregion
//#region ../../node_modules/zod/v4/core/errors.d.cts
interface $ZodIssueBase {
  readonly code?: string;
  readonly input?: unknown;
  readonly path: PropertyKey[];
  readonly message: string;
}
type $ZodInvalidTypeExpected = "string" | "number" | "int" | "boolean" | "bigint" | "symbol" | "undefined" | "null" | "never" | "void" | "date" | "array" | "object" | "tuple" | "record" | "map" | "set" | "file" | "nonoptional" | "nan" | "function" | (string & {});
interface $ZodIssueInvalidType<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_type";
  readonly expected: $ZodInvalidTypeExpected;
  readonly input?: Input;
}
interface $ZodIssueTooBig<Input = unknown> extends $ZodIssueBase {
  readonly code: "too_big";
  readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  readonly maximum: number | bigint;
  readonly inclusive?: boolean;
  readonly exact?: boolean;
  readonly input?: Input;
}
interface $ZodIssueTooSmall<Input = unknown> extends $ZodIssueBase {
  readonly code: "too_small";
  readonly origin: "number" | "int" | "bigint" | "date" | "string" | "array" | "set" | "file" | (string & {});
  readonly minimum: number | bigint;
  /** True if the allowable range includes the minimum */
  readonly inclusive?: boolean;
  /** True if the allowed value is fixed (e.g.` z.length(5)`), not a range (`z.minLength(5)`) */
  readonly exact?: boolean;
  readonly input?: Input;
}
interface $ZodIssueInvalidStringFormat extends $ZodIssueBase {
  readonly code: "invalid_format";
  readonly format: $ZodStringFormats | (string & {});
  readonly pattern?: string;
  readonly input?: string;
}
interface $ZodIssueNotMultipleOf<Input extends number | bigint = number | bigint> extends $ZodIssueBase {
  readonly code: "not_multiple_of";
  readonly divisor: number;
  readonly input?: Input;
}
interface $ZodIssueUnrecognizedKeys extends $ZodIssueBase {
  readonly code: "unrecognized_keys";
  readonly keys: string[];
  readonly input?: Record<string, unknown>;
}
interface $ZodIssueInvalidUnionNoMatch extends $ZodIssueBase {
  readonly code: "invalid_union";
  readonly errors: $ZodIssue[][];
  readonly input?: unknown;
  readonly discriminator?: string | undefined;
  readonly options?: Primitive[];
  readonly inclusive?: true;
}
interface $ZodIssueInvalidUnionMultipleMatch extends $ZodIssueBase {
  readonly code: "invalid_union";
  readonly errors: [];
  readonly input?: unknown;
  readonly discriminator?: string | undefined;
  readonly inclusive: false;
  /** Indices of the options that matched */
  readonly matches: number[];
}
type $ZodIssueInvalidUnion = $ZodIssueInvalidUnionNoMatch | $ZodIssueInvalidUnionMultipleMatch;
interface $ZodIssueInvalidKey<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_key";
  readonly origin: "map" | "record";
  readonly issues: $ZodIssue[];
  readonly input?: Input;
}
interface $ZodIssueInvalidElement<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_element";
  readonly origin: "map" | "set";
  readonly key: unknown;
  readonly issues: $ZodIssue[];
  readonly input?: Input;
}
interface $ZodIssueInvalidValue<Input = unknown> extends $ZodIssueBase {
  readonly code: "invalid_value";
  readonly values: Primitive[];
  readonly input?: Input;
}
interface $ZodIssueCustom extends $ZodIssueBase {
  readonly code: "custom";
  readonly params?: Record<string, any> | undefined;
  readonly input?: unknown;
}
type $ZodIssue = $ZodIssueInvalidType | $ZodIssueTooBig | $ZodIssueTooSmall | $ZodIssueInvalidStringFormat | $ZodIssueNotMultipleOf | $ZodIssueUnrecognizedKeys | $ZodIssueInvalidUnion | $ZodIssueInvalidKey | $ZodIssueInvalidElement | $ZodIssueInvalidValue | $ZodIssueCustom;
type $ZodInternalIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue$1<T> : never;
type RawIssue$1<T extends $ZodIssueBase> = T extends any ? Flatten<MakePartial<T, "message" | "path"> & {
  /** The input data */
  readonly input: unknown;
  /** The schema or check that originated this issue. */
  readonly inst?: $ZodType | $ZodCheck;
  /** The schema that owns the issue. Equal to `inst` when a schema originated the issue, and the schema the check was attached to when a check did. */
  readonly schema?: $ZodType | undefined;
  /** If `true`, Zod will continue executing checks/refinements after this issue. */
  readonly continue?: boolean | undefined;
} & Record<string, unknown>> : never;
type $ZodRawIssue<T extends $ZodIssueBase = $ZodIssue> = $ZodInternalIssue<T>;
interface $ZodErrorMap<T extends $ZodIssueBase = $ZodIssue> {
  (issue: $ZodRawIssue<T>): {
    message: string;
  } | string | undefined | null;
}
interface $ZodError<T = unknown> extends Error {
  type: T;
  issues: $ZodIssue[];
  _zod: {
    output: T;
    def: $ZodIssue[];
  };
  stack?: string;
  name: string;
}
declare const $ZodError: $constructor<$ZodError>;
type $ZodFlattenedError<T, U = string> = _FlattenedError<T, U>;
type _FlattenedError<T, U = string> = {
  formErrors: U[];
  fieldErrors: { [P in keyof T]?: U[]; };
};
type _ZodFormattedError<T, U = string> = T extends [any, ...any[]] ? { [K in keyof T]?: $ZodFormattedError<T[K], U>; } : T extends any[] ? {
  [k: number]: $ZodFormattedError<T[number], U>;
} : T extends object ? Flatten<{ [K in keyof T]?: $ZodFormattedError<T[K], U>; }> : any;
type $ZodFormattedError<T, U = string> = {
  _errors: U[];
} & Flatten<_ZodFormattedError<T, U>>;
//#endregion
//#region ../../node_modules/zod/v4/core/core.d.cts
type ZodTrait = {
  _zod: {
    def: any;
    [k: string]: any;
  };
};
interface $constructor<T extends ZodTrait, D = T["_zod"]["def"]> {
  new (def: D): T;
  init(inst: T, def: D): asserts inst is T;
}
interface $constructorParams {
  Parent?: typeof Class;
}
declare function $constructor<T extends ZodTrait, D = T["_zod"]["def"]>(name: string, initializer: (inst: T, def: D) => void,
/** This trait's members, installed once on every prototype that composes it. They cannot be declared in the initializer above: that runs per instance, and the prototype is shared. */
proto?: ProtoOf<T>, params?: $constructorParams): $constructor<T, D>;
declare const $brand: unique symbol;
type $brand<T extends string | number | symbol = string | number | symbol> = {
  [$brand]: { [k in T]: true; };
};
type $ZodBranded<T extends SomeType, Brand extends string | number | symbol, Dir extends "in" | "out" | "inout" = "out"> = T & (Dir extends "inout" ? {
  _zod: {
    input: input<T> & $brand<Brand>;
    output: output<T> & $brand<Brand>;
  };
} : Dir extends "in" ? {
  _zod: {
    input: input<T> & $brand<Brand>;
  };
} : {
  _zod: {
    output: output<T> & $brand<Brand>;
  };
});
type input<T> = T extends {
  _zod: {
    input: any;
  };
} ? T["_zod"]["input"] : unknown;
type output<T> = T extends {
  _zod: {
    output: any;
  };
} ? T["_zod"]["output"] : unknown;
//#endregion
//#region ../../node_modules/zod/v4/core/api.d.cts
type Params<T extends $ZodType | $ZodCheck, IssueTypes extends $ZodIssueBase, OmitKeys extends keyof T["_zod"]["def"] = never> = Flatten<Partial<EmptyToNever<Omit<T["_zod"]["def"], OmitKeys> & ([IssueTypes] extends [never] ? {} : {
  error?: string | $ZodErrorMap<IssueTypes> | undefined;
  /** @deprecated This parameter is deprecated. Use `error` instead. */
  message?: string | undefined;
})>>>;
type TypeParams<T extends $ZodType = $ZodType & {
  _isst: never;
}, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error"> = never> = Params<T, NonNullable<T["_zod"]["isst"]>, "type" | "checks" | "error" | AlsoOmit>;
type CheckParams<T extends $ZodCheck = $ZodCheck // & { _issc: never },
, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "check" | "error"> = never> = Params<T, NonNullable<T["_zod"]["issc"]>, "check" | "error" | AlsoOmit>;
type CheckStringFormatParams<T extends $ZodStringFormat = $ZodStringFormat, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never> = Params<T, NonNullable<T["_zod"]["issc"]>, "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit>;
type CheckTypeParams<T extends $ZodType & $ZodCheck = $ZodType & $ZodCheck, AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error" | "check"> = never> = Params<T, NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>, "type" | "checks" | "error" | "check" | AlsoOmit>;
type $ZodCheckEmailParams = CheckStringFormatParams<$ZodEmail, "when">;
type $ZodCheckGUIDParams = CheckStringFormatParams<$ZodGUID, "pattern" | "when">;
type $ZodCheckUUIDParams = CheckStringFormatParams<$ZodUUID, "pattern" | "when">;
type $ZodCheckURLParams = CheckStringFormatParams<$ZodURL, "when">;
type $ZodCheckEmojiParams = CheckStringFormatParams<$ZodEmoji, "when">;
type $ZodCheckNanoIDParams = CheckStringFormatParams<$ZodNanoID, "when" | "pattern">;
/**
 * @deprecated CUID v1 is deprecated by its authors due to information leakage
 * (timestamps embedded in the id). Use {@link _cuid2} instead.
 * See https://github.com/paralleldrive/cuid.
 */
type $ZodCheckCUIDParams = CheckStringFormatParams<$ZodCUID, "when">;
type $ZodCheckCUID2Params = CheckStringFormatParams<$ZodCUID2, "when">;
type $ZodCheckULIDParams = CheckStringFormatParams<$ZodULID, "when">;
type $ZodCheckXIDParams = CheckStringFormatParams<$ZodXID, "when">;
type $ZodCheckKSUIDParams = CheckStringFormatParams<$ZodKSUID, "when">;
type $ZodCheckIPv4Params = CheckStringFormatParams<$ZodIPv4, "pattern" | "when" | "version">;
type $ZodCheckIPv6Params = CheckStringFormatParams<$ZodIPv6, "pattern" | "when" | "version">;
type $ZodCheckCIDRv4Params = CheckStringFormatParams<$ZodCIDRv4, "pattern" | "when">;
type $ZodCheckCIDRv6Params = CheckStringFormatParams<$ZodCIDRv6, "pattern" | "when">;
type $ZodCheckBase64Params = CheckStringFormatParams<$ZodBase64, "pattern" | "when">;
type $ZodCheckBase64URLParams = CheckStringFormatParams<$ZodBase64URL, "pattern" | "when">;
type $ZodCheckE164Params = CheckStringFormatParams<$ZodE164, "when">;
type $ZodCheckJWTParams = CheckStringFormatParams<$ZodJWT, "pattern" | "when">;
type $ZodCheckISODateTimeParams = CheckStringFormatParams<$ZodISODateTime, "pattern" | "when">;
type $ZodCheckISODateParams = CheckStringFormatParams<$ZodISODate, "pattern" | "when">;
type $ZodCheckISOTimeParams = CheckStringFormatParams<$ZodISOTime, "pattern" | "when">;
type $ZodCheckISODurationParams = CheckStringFormatParams<$ZodISODuration, "when">;
type $ZodCheckNumberFormatParams = CheckParams<$ZodCheckNumberFormat, "format" | "when">;
type $ZodCheckLessThanParams = CheckParams<$ZodCheckLessThan, "inclusive" | "value" | "when">;
type $ZodCheckGreaterThanParams = CheckParams<$ZodCheckGreaterThan, "inclusive" | "value" | "when">;
type $ZodCheckMultipleOfParams = CheckParams<$ZodCheckMultipleOf, "value" | "when">;
type $ZodCheckMaxLengthParams = CheckParams<$ZodCheckMaxLength, "maximum" | "when">;
type $ZodCheckMinLengthParams = CheckParams<$ZodCheckMinLength, "minimum" | "when">;
type $ZodCheckLengthEqualsParams = CheckParams<$ZodCheckLengthEquals, "length" | "when">;
type $ZodCheckRegexParams = CheckParams<$ZodCheckRegex, "format" | "pattern" | "when">;
type $ZodCheckLowerCaseParams = CheckParams<$ZodCheckLowerCase, "format" | "when">;
type $ZodCheckUpperCaseParams = CheckParams<$ZodCheckUpperCase, "format" | "when">;
type $ZodCheckIncludesParams = CheckParams<$ZodCheckIncludes, "includes" | "format" | "when" | "pattern">;
type $ZodCheckStartsWithParams = CheckParams<$ZodCheckStartsWith, "prefix" | "format" | "when" | "pattern">;
type $ZodCheckEndsWithParams = CheckParams<$ZodCheckEndsWith, "suffix" | "format" | "pattern" | "when">;
type $ZodEnumParams = TypeParams<$ZodEnum, "entries">;
type $ZodNonOptionalParams = TypeParams<$ZodNonOptional, "innerType">;
type $ZodCustomParams = CheckTypeParams<$ZodCustom, "fn">;
type $ZodSuperRefineIssue<T extends $ZodIssueBase = $ZodIssue> = T extends any ? RawIssue<T> : never;
type RawIssue<T extends $ZodIssueBase> = T extends any ? Flatten<MakePartial<T, "message" | "path"> & {
  /** The schema or check that originated this issue. */
  readonly inst?: $ZodType | $ZodCheck;
  /** If `true`, Zod will execute subsequent checks/refinements instead of immediately aborting */
  readonly continue?: boolean | undefined;
} & Record<string, unknown>> : never;
interface $RefinementCtx<T = unknown> extends ParsePayload<T> {
  addIssue(arg: string | $ZodSuperRefineIssue): void;
}
interface $ZodSuperRefineParams {
  /** If provided, the refinement runs only when this returns `true`. By default, it is skipped if prior parsing produced aborting issues. */
  when?: ((payload: ParsePayload) => boolean) | undefined;
}
//#endregion
//#region ../../node_modules/zod/v4/classic/errors.d.cts
/** An Error-like class used to store Zod validation issues.  */
interface ZodError<T = unknown> extends $ZodError<T> {
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  format(): $ZodFormattedError<T>;
  format<U>(mapper: (issue: $ZodIssue) => U): $ZodFormattedError<T, U>;
  /** @deprecated Use the `z.treeifyError(err)` function instead. */
  flatten(): $ZodFlattenedError<T>;
  flatten<U>(mapper: (issue: $ZodIssue) => U): $ZodFlattenedError<T, U>;
  /** @deprecated Push directly to `.issues` instead. */
  addIssue(issue: $ZodIssue): void;
  /** @deprecated Push directly to `.issues` instead. */
  addIssues(issues: $ZodIssue[]): void;
  /** @deprecated Check `err.issues.length === 0` instead. */
  isEmpty: boolean;
}
declare const ZodError: $constructor<ZodError>;
//#endregion
//#region ../../node_modules/zod/v4/classic/parse.d.cts
type ZodSafeParseResult<T> = ZodSafeParseSuccess<T> | ZodSafeParseError<T>;
type ZodSafeParseSuccess<T> = {
  success: true;
  data: T;
  error?: never;
};
type ZodSafeParseError<T> = {
  success: false;
  data?: never;
  error: ZodError<T>;
};
//#endregion
//#region ../../node_modules/zod/v4/classic/schemas.d.cts
type ZodStandardSchemaWithJSON<T> = StandardSchemaWithJSONProps<input<T>, output<T>>;
interface ZodType<out Output = unknown, out Input = unknown, out Internals extends $ZodTypeInternals<Output, Input> = $ZodTypeInternals<Output, Input>> extends $ZodType<Output, Input, Internals> {
  def: Internals["def"];
  type: Internals["def"]["type"];
  /** @deprecated Use `.def` instead. */
  _def: Internals["def"];
  /** @deprecated Use `z.output<typeof schema>` instead. */
  _output: Internals["output"];
  /** @deprecated Use `z.input<typeof schema>` instead. */
  _input: Internals["input"];
  "~standard": ZodStandardSchemaWithJSON<this>;
  /** Converts this schema to a JSON Schema representation. */
  toJSONSchema(params?: ToJSONSchemaParams): ZodStandardJSONSchemaPayload<this>;
  check(...checks: (CheckFn<output<this>> | $ZodCheck<output<this>>)[]): this;
  with(...checks: (CheckFn<output<this>> | $ZodCheck<output<this>>)[]): this;
  clone(def?: Internals["def"], params?: {
    parent: boolean;
  }): this;
  register<R extends $ZodRegistry>(registry: R, ...meta: this extends R["_schema"] ? undefined extends R["_meta"] ? [$replace<R["_meta"], this>?] : [$replace<R["_meta"], this>] : ["Incompatible schema"]): this;
  brand<T extends PropertyKey = PropertyKey, Dir extends "in" | "out" | "inout" = "out">(value?: T): PropertyKey extends T ? this : $ZodBranded<this, T, Dir>;
  parse(data: unknown, params?: ParseContext<$ZodIssue>): output<this>;
  safeParse(data: unknown, params?: ParseContext<$ZodIssue>): ZodSafeParseResult<output<this>>;
  parseAsync(data: unknown, params?: ParseContext<$ZodIssue>): Promise<output<this>>;
  safeParseAsync(data: unknown, params?: ParseContext<$ZodIssue>): Promise<ZodSafeParseResult<output<this>>>;
  spa: (data: unknown, params?: ParseContext<$ZodIssue>) => Promise<ZodSafeParseResult<output<this>>>;
  validate(data: unknown, params?: ParseContext<$ZodIssue>): data is input<this>;
  validateAsync(data: unknown, params?: ParseContext<$ZodIssue>): Promise<boolean>;
  encode(data: output<this>, params?: ParseContext<$ZodIssue>): input<this>;
  decode(data: input<this>, params?: ParseContext<$ZodIssue>): output<this>;
  encodeAsync(data: output<this>, params?: ParseContext<$ZodIssue>): Promise<input<this>>;
  decodeAsync(data: input<this>, params?: ParseContext<$ZodIssue>): Promise<output<this>>;
  safeEncode(data: output<this>, params?: ParseContext<$ZodIssue>): ZodSafeParseResult<input<this>>;
  safeDecode(data: input<this>, params?: ParseContext<$ZodIssue>): ZodSafeParseResult<output<this>>;
  safeEncodeAsync(data: output<this>, params?: ParseContext<$ZodIssue>): Promise<ZodSafeParseResult<input<this>>>;
  safeDecodeAsync(data: input<this>, params?: ParseContext<$ZodIssue>): Promise<ZodSafeParseResult<output<this>>>;
  refine<Ch extends (arg: output<this>) => unknown | Promise<unknown>>(check: Ch, params?: string | $ZodCustomParams): Ch extends ((arg: any) => arg is infer R) ? this & ZodType<R, input<this>> : this;
  superRefine(refinement: (arg: output<this>, ctx: $RefinementCtx<output<this>>) => void | Promise<void>, params?: $ZodSuperRefineParams): this;
  overwrite(fn: (x: output<this>) => output<this>): this;
  optional(): ZodOptional<this>;
  exactOptional(): ZodExactOptional<this>;
  nonoptional(params?: string | $ZodNonOptionalParams): ZodNonOptional<this>;
  nullable(): ZodNullable<this>;
  nullish(): ZodOptional<ZodNullable<this>>;
  default(def: NoUndefined<output<this>>): ZodDefault<this>;
  default(def: () => NoUndefined<output<this>>): ZodDefault<this>;
  prefault(def: () => input<this>): ZodPrefault<this>;
  prefault(def: input<this>): ZodPrefault<this>;
  array(): ZodArray<this>;
  or<T extends SomeType>(option: T): ZodUnion<[this, T]>;
  and<T extends SomeType>(incoming: T): ZodIntersection<this, T>;
  transform<NewOut>(transform: (arg: output<this>, ctx: $RefinementCtx<output<this>>) => NewOut | Promise<NewOut>): ZodPipe<this, ZodTransform<Awaited<NewOut>, output<this>>>;
  catch(def: output<this>): ZodCatch<this>;
  catch(def: (ctx: $ZodCatchCtx) => output<this>): ZodCatch<this>;
  pipe<T extends $ZodType<any, output<this>>>(target: T | $ZodType<any, output<this>>): ZodPipe<this, T>;
  readonly(): ZodReadonly<this>;
  /** Returns a new instance that has been registered in `z.globalRegistry` with the specified description */
  describe(description: string): this;
  description?: string;
  /** Returns the metadata associated with this instance in `z.globalRegistry` */
  meta(): $replace<GlobalMeta, this> | undefined;
  /** Returns a new instance that has been registered in `z.globalRegistry` with the specified metadata */
  meta(data: $replace<GlobalMeta, this>): this;
  /** @deprecated Try safe-parsing `undefined` (this is what `isOptional` does internally):
   *
   * ```ts
   * const schema = z.string().optional();
   * const isOptional = schema.safeParse(undefined).success; // true
   * ```
   */
  isOptional(): boolean;
  /**
   * @deprecated Try safe-parsing `null` (this is what `isNullable` does internally):
   *
   * ```ts
   * const schema = z.string().nullable();
   * const isNullable = schema.safeParse(null).success; // true
   * ```
   */
  isNullable(): boolean;
  apply<T, TArgs extends unknown[] = []>(fn: (schema: this, ...args: TArgs) => T, ...args: TArgs): T;
}
interface _ZodType<out Internals extends $ZodTypeInternals = $ZodTypeInternals> extends ZodType<any, any, Internals> {}
declare const ZodType: $constructor<ZodType>;
interface _ZodString<T extends $ZodStringInternals<unknown> = $ZodStringInternals<unknown>> extends _ZodType<T> {
  format: string | null;
  minLength: number | null;
  maxLength: number | null;
  regex(regex: RegExp, params?: string | $ZodCheckRegexParams): this;
  includes(value: string, params?: string | $ZodCheckIncludesParams): this;
  startsWith(value: string, params?: string | $ZodCheckStartsWithParams): this;
  endsWith(value: string, params?: string | $ZodCheckEndsWithParams): this;
  min(minLength: number, params?: string | $ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | $ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | $ZodCheckLengthEqualsParams): this;
  nonempty(params?: string | $ZodCheckMinLengthParams): this;
  lowercase(params?: string | $ZodCheckLowerCaseParams): this;
  uppercase(params?: string | $ZodCheckUpperCaseParams): this;
  trim(): this;
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD" | (string & {})): this;
  toLowerCase(): this;
  toUpperCase(): this;
  slugify(): this;
}
/** @internal */
declare const _ZodString: $constructor<_ZodString>;
interface ZodString extends _ZodString<$ZodStringInternals<string>> {
  /** @deprecated Use `z.email()` instead. */
  email(params?: string | $ZodCheckEmailParams): this;
  /** @deprecated Use `z.url()` instead. */
  url(params?: string | $ZodCheckURLParams): this;
  /** @deprecated Use `z.jwt()` instead. */
  jwt(params?: string | $ZodCheckJWTParams): this;
  /** @deprecated Use `z.emoji()` instead. */
  emoji(params?: string | $ZodCheckEmojiParams): this;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | $ZodCheckGUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuid(params?: string | $ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv4(params?: string | $ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv6(params?: string | $ZodCheckUUIDParams): this;
  /** @deprecated Use `z.uuid()` instead. */
  uuidv7(params?: string | $ZodCheckUUIDParams): this;
  /** @deprecated Use `z.nanoid()` instead. */
  nanoid(params?: string | $ZodCheckNanoIDParams): this;
  /** @deprecated Use `z.guid()` instead. */
  guid(params?: string | $ZodCheckGUIDParams): this;
  /**
   * @deprecated CUID v1 is deprecated by its authors due to information leakage
   * (timestamps embedded in the id). Use `z.cuid2()` instead.
   * See https://github.com/paralleldrive/cuid.
   */
  cuid(params?: string | $ZodCheckCUIDParams): this;
  /** @deprecated Use `z.cuid2()` instead. */
  cuid2(params?: string | $ZodCheckCUID2Params): this;
  /** @deprecated Use `z.ulid()` instead. */
  ulid(params?: string | $ZodCheckULIDParams): this;
  /** @deprecated Use `z.base64()` instead. */
  base64(params?: string | $ZodCheckBase64Params): this;
  /** @deprecated Use `z.base64url()` instead. */
  base64url(params?: string | $ZodCheckBase64URLParams): this;
  /** @deprecated Use `z.xid()` instead. */
  xid(params?: string | $ZodCheckXIDParams): this;
  /** @deprecated Use `z.ksuid()` instead. */
  ksuid(params?: string | $ZodCheckKSUIDParams): this;
  /** @deprecated Use `z.ipv4()` instead. */
  ipv4(params?: string | $ZodCheckIPv4Params): this;
  /** @deprecated Use `z.ipv6()` instead. */
  ipv6(params?: string | $ZodCheckIPv6Params): this;
  /** @deprecated Use `z.cidrv4()` instead. */
  cidrv4(params?: string | $ZodCheckCIDRv4Params): this;
  /** @deprecated Use `z.cidrv6()` instead. */
  cidrv6(params?: string | $ZodCheckCIDRv6Params): this;
  /** @deprecated Use `z.e164()` instead. */
  e164(params?: string | $ZodCheckE164Params): this;
  /** @deprecated Use `z.iso.datetime()` instead. */
  datetime(params?: string | $ZodCheckISODateTimeParams): this;
  /** @deprecated Use `z.iso.date()` instead. */
  date(params?: string | $ZodCheckISODateParams): this;
  /** @deprecated Use `z.iso.time()` instead. */
  time(params?: string | $ZodCheckISOTimeParams): this;
  /** @deprecated Use `z.iso.duration()` instead. */
  duration(params?: string | $ZodCheckISODurationParams): this;
}
declare const ZodString: $constructor<ZodString>;
interface ZodStringFormat<Format extends string = string> extends _ZodString<$ZodStringFormatInternals<Format>> {}
declare const ZodStringFormat: $constructor<ZodStringFormat>;
interface ZodEmail extends ZodStringFormat<"email"> {
  _zod: $ZodEmailInternals;
}
declare const ZodEmail: $constructor<ZodEmail>;
interface ZodUUID extends ZodStringFormat<"uuid"> {
  _zod: $ZodUUIDInternals;
}
declare const ZodUUID: $constructor<ZodUUID>;
interface _ZodNumber<Internals extends $ZodNumberInternals = $ZodNumberInternals> extends _ZodType<Internals> {
  gt(value: number, params?: string | $ZodCheckGreaterThanParams): this;
  /** Identical to .min() */
  gte(value: number, params?: string | $ZodCheckGreaterThanParams): this;
  min(value: number, params?: string | $ZodCheckGreaterThanParams): this;
  lt(value: number, params?: string | $ZodCheckLessThanParams): this;
  /** Identical to .max() */
  lte(value: number, params?: string | $ZodCheckLessThanParams): this;
  max(value: number, params?: string | $ZodCheckLessThanParams): this;
  /** Consider `z.int()` instead. This API is considered *legacy*; it will never be removed but a better alternative exists. */
  int(params?: string | $ZodCheckNumberFormatParams): this;
  /** @deprecated This is now identical to `.int()`. Only numbers in the safe integer range are accepted. */
  safe(params?: string | $ZodCheckNumberFormatParams): this;
  positive(params?: string | $ZodCheckGreaterThanParams): this;
  nonnegative(params?: string | $ZodCheckGreaterThanParams): this;
  negative(params?: string | $ZodCheckLessThanParams): this;
  nonpositive(params?: string | $ZodCheckLessThanParams): this;
  multipleOf(value: number, params?: string | $ZodCheckMultipleOfParams): this;
  /** @deprecated Use `.multipleOf()` instead. */
  step(value: number, params?: string | $ZodCheckMultipleOfParams): this;
  /** @deprecated In v4 and later, z.number() does not allow infinite values by default. This is a no-op. */
  finite(params?: unknown): this;
  minValue: number | null;
  maxValue: number | null;
  /** @deprecated Check the `format` property instead.  */
  isInt: boolean;
  /** @deprecated Number schemas no longer accept infinite values, so this always returns `true`. */
  isFinite: boolean;
  format: string | null;
}
interface ZodNumber extends _ZodNumber<$ZodNumberInternals<number>> {}
declare const ZodNumber: $constructor<ZodNumber>;
interface ZodNumberFormat<Format extends $ZodNumberFormats = $ZodNumberFormats> extends ZodNumber {
  _zod: $ZodNumberFormatInternals<Format>;
}
declare const ZodNumberFormat: $constructor<ZodNumberFormat>;
interface ZodInt extends ZodNumberFormat<"safeint"> {}
interface ZodArray<T extends SomeType = $ZodType> extends _ZodType<$ZodArrayInternals<T>>, $ZodArray<T> {
  element: T;
  min(minLength: number, params?: string | $ZodCheckMinLengthParams): this;
  nonempty(params?: string | $ZodCheckMinLengthParams): this;
  max(maxLength: number, params?: string | $ZodCheckMaxLengthParams): this;
  length(len: number, params?: string | $ZodCheckLengthEqualsParams): this;
  unwrap(): T;
  "~standard": ZodStandardSchemaWithJSON<this>;
}
declare const ZodArray: $constructor<ZodArray>;
type SafeExtendShape<Base extends $ZodShape, Ext extends $ZodLooseShape> = { [K in keyof Ext]: K extends keyof Base ? output<Ext[K]> extends output<Base[K]> ? input<Ext[K]> extends input<Base[K]> ? Ext[K] : never : never : Ext[K]; };
interface ZodObject<
/** @ts-ignore Cast variance */
out Shape extends $ZodShape = $ZodLooseShape, out Config extends $ZodObjectConfig = $strip> extends _ZodType<$ZodObjectInternals<Shape, Config>>, $ZodObject<Shape, Config> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  shape: Shape;
  keyof(): ZodEnum<ToEnum<keyof Shape & string>>;
  /** Define a schema to validate all unrecognized keys. This overrides the existing strict/loose behavior. */
  catchall<T extends SomeType>(schema: T): ZodObject<Shape, $catchall<T>>;
  /** @deprecated Use `z.looseObject()` or `.loose()` instead. */
  passthrough(): ZodObject<Shape, $loose>;
  /** Consider `z.looseObject(A.shape)` instead */
  loose(): ZodObject<Shape, $loose>;
  /** Consider `z.strictObject(A.shape)` instead */
  strict(): ZodObject<Shape, $strict>;
  /** This is the default behavior. This method call is likely unnecessary. */
  strip(): ZodObject<Shape, $strip>;
  extend<U extends $ZodLooseShape>(shape: U): ZodObject<Extend<Shape, Writeable<U>>, Config>;
  safeExtend<U extends $ZodLooseShape>(shape: SafeExtendShape<Shape, U> & Partial<Record<keyof Shape, SomeType>>): ZodObject<Extend<Shape, Writeable<U>>, Config>;
  /**
   * @deprecated Use [`A.extend(B.shape)`](https://zod.dev/api?id=extend) instead.
   */
  merge<U extends ZodObject>(other: U): ZodObject<Extend<Shape, U["shape"]>, U["_zod"]["config"]>;
  pick<M extends Mask<keyof Shape>>(mask: M & Record<Exclude<keyof M, keyof Shape>, never>): ZodObject<Flatten<Pick<Shape, Extract<keyof Shape, keyof M>>>, Config>;
  omit<M extends Mask<keyof Shape>>(mask: M & Record<Exclude<keyof M, keyof Shape>, never>): ZodObject<Flatten<Omit<Shape, Extract<keyof Shape, keyof M>>>, Config>;
  partial(): ZodObject<{ -readonly [k in keyof Shape]: ZodOptional<Shape[k]>; }, Config>;
  partial<M extends Mask<keyof Shape>>(mask: M & Record<Exclude<keyof M, keyof Shape>, never>): ZodObject<{ -readonly [k in keyof Shape]: k extends keyof M ? ZodOptional<Shape[k]> : Shape[k]; }, Config>;
  exactPartial(): ZodObject<{ -readonly [k in keyof Shape]: ZodExactOptional<Shape[k]>; }, Config>;
  exactPartial<M extends Mask<keyof Shape>>(mask: M & Record<Exclude<keyof M, keyof Shape>, never>): ZodObject<{ -readonly [k in keyof Shape]: k extends keyof M ? ZodExactOptional<Shape[k]> : Shape[k]; }, Config>;
  required(): ZodObject<{ -readonly [k in keyof Shape]: ZodNonOptional<Shape[k]>; }, Config>;
  required<M extends Mask<keyof Shape>>(mask: M & Record<Exclude<keyof M, keyof Shape>, never>): ZodObject<{ -readonly [k in keyof Shape]: k extends keyof M ? ZodNonOptional<Shape[k]> : Shape[k]; }, Config>;
}
declare const ZodObject: $constructor<ZodObject>;
interface ZodUnion<T extends readonly SomeType[] = readonly $ZodType[]> extends _ZodType<$ZodUnionInternals<T>>, $ZodUnion<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  options: T;
}
declare const ZodUnion: $constructor<ZodUnion>;
interface ZodIntersection<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends _ZodType<$ZodIntersectionInternals<A, B>>, $ZodIntersection<A, B> {
  "~standard": ZodStandardSchemaWithJSON<this>;
}
declare const ZodIntersection: $constructor<ZodIntersection>;
interface ZodEnum<
/** @ts-ignore Cast variance */
out T extends EnumLike = EnumLike> extends _ZodType<$ZodEnumInternals<T>>, $ZodEnum<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  enum: T;
  options: Array<T[keyof T]>;
  extract<const U extends readonly (keyof T)[]>(values: U, params?: string | $ZodEnumParams): ZodEnum<Flatten<Pick<T, U[number]>>>;
  exclude<const U extends readonly (keyof T)[]>(values: U, params?: string | $ZodEnumParams): ZodEnum<Flatten<Omit<T, U[number]>>>;
}
declare const ZodEnum: $constructor<ZodEnum>;
interface ZodTransform<O = unknown, I = unknown> extends _ZodType<$ZodTransformInternals<O, I>>, $ZodTransform<O, I> {
  "~standard": ZodStandardSchemaWithJSON<this>;
}
declare const ZodTransform: $constructor<ZodTransform>;
interface ZodOptional<T extends SomeType = $ZodType> extends _ZodType<$ZodOptionalInternals<T>>, $ZodOptional<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodOptional: $constructor<ZodOptional>;
interface ZodExactOptional<T extends SomeType = $ZodType> extends _ZodType<$ZodExactOptionalInternals<T>>, $ZodExactOptional<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodExactOptional: $constructor<ZodExactOptional>;
interface ZodNullable<T extends SomeType = $ZodType> extends _ZodType<$ZodNullableInternals<T>>, $ZodNullable<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodNullable: $constructor<ZodNullable>;
interface ZodDefault<T extends SomeType = $ZodType> extends _ZodType<$ZodDefaultInternals<T>>, $ZodDefault<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeDefault(): T;
}
declare const ZodDefault: $constructor<ZodDefault>;
interface ZodPrefault<T extends SomeType = $ZodType> extends _ZodType<$ZodPrefaultInternals<T>>, $ZodPrefault<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodPrefault: $constructor<ZodPrefault>;
interface ZodNonOptional<T extends SomeType = $ZodType> extends _ZodType<$ZodNonOptionalInternals<T>>, $ZodNonOptional<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodNonOptional: $constructor<ZodNonOptional>;
interface ZodCatch<T extends SomeType = $ZodType> extends _ZodType<$ZodCatchInternals<T>>, $ZodCatch<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
  /** @deprecated Use `.unwrap()` instead. */
  removeCatch(): T;
}
declare const ZodCatch: $constructor<ZodCatch>;
interface ZodPipe<A extends SomeType = $ZodType, B extends SomeType = $ZodType> extends _ZodType<$ZodPipeInternals<A, B>>, $ZodPipe<A, B> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  in: A;
  out: B;
}
declare const ZodPipe: $constructor<ZodPipe>;
interface ZodReadonly<T extends SomeType = $ZodType> extends _ZodType<$ZodReadonlyInternals<T>>, $ZodReadonly<T> {
  "~standard": ZodStandardSchemaWithJSON<this>;
  unwrap(): T;
}
declare const ZodReadonly: $constructor<ZodReadonly>;
//#endregion
//#region src/modules/user/user-controller.d.ts
declare class UserController {
  static updateUser: {
    (req: VovkRequest<{
      email: string;
      profile: {
        name: string;
        age: number;
      };
    }, {
      notify: "email" | "none" | "push";
    }, {
      id: string;
    }, {
      email: string;
      profile: {
        name: string;
        age: number;
      };
    }, {
      notify: "email" | "none" | "push";
    }>, params: {
      id: string;
    }): any;
    __types: {
      body: {
        email: string;
        profile: {
          name: string;
          age: number;
        };
      };
      query: {
        notify: "email" | "none" | "push";
      };
      params: {
        id: string;
      };
      output: {
        success: boolean;
        id: string;
        notify: "email" | "none" | "push";
      };
      iteration: unknown;
      contentType: ["application/json"];
      input: VovkProcedureInput<ZodObject<{
        email: ZodEmail;
        profile: ZodObject<{
          name: ZodString;
          age: ZodInt;
        }, $strip>;
      }, $strip>, ZodObject<{
        notify: ZodEnum<{
          email: "email";
          none: "none";
          push: "push";
        }>;
      }, $strip>, ZodObject<{
        id: ZodUUID;
      }, $strip>, ["application/json"]>;
    };
    __handleFn: (req: VovkRequest<{
      email: string;
      profile: {
        name: string;
        age: number;
      };
    }, {
      notify: "email" | "none" | "push";
    }, {
      id: string;
    }, {
      email: string;
      profile: {
        name: string;
        age: number;
      };
    }, {
      notify: "email" | "none" | "push";
    }>, params: {
      id: string;
    }) => Promise<{
      success: boolean;
      id: string;
      notify: "email" | "none" | "push";
    }> | {
      success: boolean;
      id: string;
      notify: "email" | "none" | "push";
    };
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body: Blob | {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        };
        query: {
          notify: "email" | "none" | "push";
        };
        params: {
          id: string;
        };
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } & {
        transform: (data: {
          success: boolean;
          id: string;
          notify: "email" | "none" | "push";
        }, fakeReq: Pick<VovkRequest<{
          email: string;
          profile: {
            name: string;
            age: number;
          };
        }, {
          notify: "email" | "none" | "push";
        }, {
          id: string;
        }, {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        }, {
          notify: "email" | "none" | "push";
        }>, "vovk">) => TTransformed;
      }): Promise<TTransformed>;
      <TReturnType = {
        success: boolean;
        id: string;
        notify: "email" | "none" | "push";
      }>(input: {
        body: Blob | {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        };
        query: {
          notify: "email" | "none" | "push";
        };
        params: {
          id: string;
        };
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      }): Promise<Awaited<VovkNoInference<TReturnType>>>;
      (input: {
        body: Blob | {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        };
        query: {
          notify: "email" | "none" | "push";
        };
        params: {
          id: string;
        };
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      }): Promise<{
        success: boolean;
        id: string;
        notify: "email" | "none" | "push";
      }>;
    };
    definition: any;
    schema: any;
    wrapper?: any;
  };
}
//#endregion
//#region src/modules/stream/stream-controller.d.ts
declare class StreamController {
  static streamTokens: {
    (req: VovkRequest<unknown, unknown, Record<string, string>, unknown, unknown>, params: Record<string, string>): any;
    __types: {
      body: unknown;
      query: unknown;
      params: unknown;
      output: any;
      iteration: {
        message: string;
      };
      contentType: ["application/json"];
      input: {
        params?: Record<string, string>;
      };
    };
    __handleFn: () => AsyncGenerator<{
      message: string;
    }, void, unknown>;
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body?: unknown;
        query?: unknown;
        params?: Record<string, string>;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } & {
        transform: (data: AsyncGenerator<{
          message: string;
        }, void, unknown>, fakeReq: Pick<VovkRequest<unknown, unknown, Record<string, string>, unknown, unknown>, "vovk">) => TTransformed;
      }): Promise<TTransformed>;
      <TReturnType = AsyncGenerator<{
        message: string;
      }, void, unknown>>(input?: {
        body?: unknown;
        query?: unknown;
        params?: Record<string, string>;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): Promise<Awaited<VovkNoInference<TReturnType>>>;
      (input?: {
        body?: unknown;
        query?: unknown;
        params?: Record<string, string>;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): Promise<AsyncGenerator<{
        message: string;
      }, void, unknown>>;
    };
    definition: any;
    schema: any;
    wrapper?: any;
  };
}
//#endregion
//#region src/modules/static/openapi/openapi-controller.d.ts
declare class OpenApiController {
  static getSpec: () => {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      license: {
        name: string;
        url: string;
      };
    };
    servers: {
      url: string;
      description: string;
    }[];
    components: {
      schemas: {
        HttpStatus: {
          type: string;
          description: string;
          enum: number[];
        };
        VovkErrorResponse: {
          type: string;
          description: string;
          properties: {
            cause: {
              description: string;
            };
            statusCode: {
              $ref: string;
            };
            message: {
              type: string;
              description: string;
            };
            isError: {
              type: string;
              const: boolean;
              description: string;
            };
          };
          required: string[];
          additionalProperties: boolean;
        };
      };
    };
    paths: {
      "/api/users/{id}": {
        post: {
          summary: string;
          description: string;
          "x-codeSamples": {
            label: string;
            lang: string;
            source: string;
          }[];
          parameters: ({
            name: string;
            in: string;
            required: boolean;
            schema: {
              type: string;
              enum: string[];
              description: string;
              format?: undefined;
              pattern?: undefined;
              examples?: undefined;
            };
          } | {
            name: string;
            in: string;
            required: boolean;
            schema: {
              enum?: undefined;
              type: string;
              format: string;
              pattern: string;
              description: string;
              examples: string[];
            };
          })[];
          responses: {
            "200": {
              description: string;
              content: {
                "application/json": {
                  schema: {
                    $schema: string;
                    type: string;
                    properties: {
                      success: {
                        type: string;
                        description: string;
                      };
                      id: {
                        type: string;
                        format: string;
                        pattern: string;
                        description: string;
                      };
                      notify: {
                        type: string;
                        enum: string[];
                        description: string;
                      };
                    };
                    required: string[];
                    additionalProperties: boolean;
                    description: string;
                  };
                };
              };
            };
          };
          requestBody: {
            description: string;
            required: boolean;
            content: {
              "application/json": {
                schema: {
                  $schema: string;
                  type: string;
                  properties: {
                    email: {
                      type: string;
                      format: string;
                      pattern: string;
                      description: string;
                      examples: string[];
                    };
                    profile: {
                      type: string;
                      properties: {
                        name: {
                          type: string;
                          minLength: number;
                          description: string;
                          examples: string[];
                        };
                        age: {
                          type: string;
                          minimum: number;
                          maximum: number;
                          description: string;
                          examples: number[];
                        };
                      };
                      required: string[];
                      description: string;
                    };
                  };
                  required: string[];
                  description: string;
                };
              };
            };
          };
        };
      };
      "/api/streams/tokens": {
        get: {
          summary: string;
          description: string;
          "x-codeSamples": {
            label: string;
            lang: string;
            source: string;
          }[];
          responses: {
            "200": {
              description: string;
              content: {
                "application/jsonl": {
                  schema: {
                    $schema: string;
                    type: string;
                    properties: {
                      message: {
                        type: string;
                        description: string;
                      };
                    };
                    required: string[];
                    additionalProperties: boolean;
                    description: string;
                  };
                  example: string;
                };
              };
            };
          };
        };
      };
      "/api/static/openapi.json": {
        get: {
          summary: string;
          description: string;
          "x-codeSamples": {
            label: string;
            lang: string;
            source: string;
          }[];
        };
      };
    };
  };
}
//#endregion
//#region tmp_prebundle/schema.d.ts
declare const schema$1: {
  $schema: string;
  segments: {
    '': {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      segmentType: string;
      controllers: {
        UserRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            updateUser: {
              validation: {
                body: {
                  $schema: string;
                  type: string;
                  properties: {
                    email: {
                      type: string;
                      format: string;
                      pattern: string;
                      description: string;
                      examples: string[];
                    };
                    profile: {
                      type: string;
                      properties: {
                        name: {
                          type: string;
                          minLength: number;
                          description: string;
                          examples: string[];
                        };
                        age: {
                          type: string;
                          minimum: number;
                          maximum: number;
                          description: string;
                          examples: number[];
                        };
                      };
                      required: string[];
                      description: string;
                    };
                  };
                  required: string[];
                  description: string;
                };
                query: {
                  $schema: string;
                  type: string;
                  properties: {
                    notify: {
                      type: string;
                      enum: string[];
                      description: string;
                    };
                  };
                  required: string[];
                  description: string;
                };
                params: {
                  $schema: string;
                  type: string;
                  properties: {
                    id: {
                      type: string;
                      format: string;
                      pattern: string;
                      description: string;
                      examples: string[];
                    };
                  };
                  required: string[];
                  description: string;
                };
                output: {
                  $schema: string;
                  type: string;
                  properties: {
                    success: {
                      type: string;
                      description: string;
                    };
                    id: {
                      type: string;
                      format: string;
                      pattern: string;
                      description: string;
                    };
                    notify: {
                      type: string;
                      enum: string[];
                      description: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  description: string;
                };
              };
              operationObject: {
                summary: string;
                description: string;
              };
              path: string;
              httpMethod: string;
            };
          };
        };
        StreamRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            streamTokens: {
              validation: {
                iteration: {
                  $schema: string;
                  type: string;
                  properties: {
                    message: {
                      type: string;
                      description: string;
                    };
                  };
                  required: string[];
                  additionalProperties: boolean;
                  description: string;
                };
              };
              operationObject: {
                summary: string;
                description: string;
              };
              path: string;
              httpMethod: string;
            };
          };
        };
      };
    };
    static: {
      $schema: string;
      emitSchema: boolean;
      segmentName: string;
      segmentType: string;
      controllers: {
        OpenApiRPC: {
          rpcModuleName: string;
          originalControllerName: string;
          prefix: string;
          handlers: {
            getSpec: {
              path: string;
              httpMethod: string;
              operationObject: {
                summary: string;
                description: string;
              };
            };
          };
        };
      };
    };
  };
  meta: {
    $schema: string;
    config: {
      libs: {};
      rootEntry: string;
      $schema: string;
    };
  };
};
//#endregion
//#region tmp_prebundle/index.d.ts
declare const UserRPC: VovkRPCModule<typeof UserController, {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | VovkValidateOnClient<unknown> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
declare const StreamRPC: VovkRPCModule<typeof StreamController, {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | VovkValidateOnClient<unknown> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
declare const OpenApiRPC: VovkRPCModule<typeof OpenApiController, {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | VovkValidateOnClient<unknown> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
//#endregion
export { OpenApiRPC, StreamRPC, UserRPC, schema$1 as schema };