import { NextResponse } from "next/server.js";
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
  private isClosed;
  private i;
  private pendingSends;
  private sendQueue;
  private hasSent;
  private controller?;
  private readonly encoder;
  readonly readableStream: ReadableStream | null;
  readonly headers: Record<string, string>;
  onBeforeSend: (item: T, i: number) => T | Promise<T>;
  constructor(request?: Request | null, getResponse?: (responder: JSONLinesResponder<T>) => Response);
  readonly send: (item: T) => Promise<void>;
  sendLineOrError: (data: T | StreamAbortMessage) => void;
  readonly close: () => Promise<void>;
  readonly throw: (e: unknown) => Promise<void>;
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
type Prettify<T> = { [K in keyof T]: T[K]; } & {};
type KnownAny = any;
type StaticClass = Function;
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
/**
 * The Vovk.ts request object extending Next.js's NextRequest, generics: TBody, TQuery, TParams.
 * @see https://vovk.dev/procedure
 */
interface VovkRequest<TBody = unknown, TQuery = unknown, TParams = unknown> extends Request {
  json: () => Promise<TBody>;
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
    searchParams: {
      get: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends readonly (infer ITEM)[] ? ITEM : TQuery[KEY];
      getAll: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends unknown[] ? TQuery[KEY] : TQuery[KEY][];
      entries: () => IterableIterator<[keyof TQuery, TQuery[keyof TQuery]]>;
      forEach: (callbackfn: (value: TQuery[keyof TQuery], key: keyof TQuery) => void) => void;
      keys: () => IterableIterator<keyof TQuery>;
      values: () => IterableIterator<TQuery[keyof TQuery]>;
    };
  };
  vovk: {
    body: () => Promise<TBody>;
    query: () => TQuery;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    params: () => TParams;
  };
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
/**
 * This file is borrowed from type-fest in order to keep dependencies clean.
 * @see https://github.com/sindresorhus/type-fest
 */
type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type LiteralUnion<LiteralType, BaseType extends Primitive> = LiteralType | (BaseType & Record<never, never>);
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
declare const textTypes: readonly ["application/xml", "application/xhtml+xml", "application/javascript", "application/x-javascript", "application/ecmascript", "application/yaml", "application/x-yaml", "application/graphql", "application/sql", "application/toml", "application/x-ndjson", "application/ndjson", "application/jsonl", "application/jsonlines", "application/x-jsonlines"];
//#endregion
//#region ../../packages/vovk/dist/types/validation.d.ts
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
};
type VovkControllerInternal = {
  _segmentName: string;
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  prefix?: VovkControllerSchema['prefix'];
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
type StaticMethodInput<T extends ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => KnownAny) & {
  __types?: {
    contentType: ContentType[];
  };
}> = OmitNullable<(Parameters<T>[0] extends VovkRequest<infer TBody, infer TQuery, infer TParams> ? (T['__types'] extends {
  contentType: infer CT extends ContentType[];
} ? unknown extends TBody ? unknown : {
  body: BodyTypeFromContentType<CT, TBody>;
} : TBody extends Record<KnownAny, KnownAny> ? {
  body: TBody;
} : unknown) & (TQuery extends Record<KnownAny, KnownAny> ? {
  query: TQuery;
} : unknown) & (TParams extends Record<KnownAny, KnownAny> ? {
  params: TParams;
} : unknown) & {
  meta?: {
    [key: string]: KnownAny;
  };
} : unknown) & (Parameters<T>[1] extends Record<KnownAny, KnownAny> ? {
  params: Parameters<T>[1];
} : unknown)>;
type ToPromise<T> = T extends PromiseLike<unknown> ? T : Promise<T>;
type VovkStreamAsyncIterable<T> = {
  status: number;
  asPromise: () => Promise<T[]>;
  [Symbol.dispose](): Promise<void> | void;
  [Symbol.asyncDispose](): Promise<void> | void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
  abortSilently: () => void;
  onIterate: (cb: (data: T, i: number) => void) => () => void;
  abortController: AbortController;
};
type IsNextJs = NextResponse extends Response ? true : false;
type ActualReturnType<T extends ControllerStaticMethod> = T extends {
  __handleFn: (...args: KnownAny[]) => infer R;
} ? R : ReturnType<T>;
type StaticMethodReturn<T extends ControllerStaticMethod> = IsNextJs extends true ? ActualReturnType<T> extends NextResponse<infer U> | Promise<NextResponse<infer U>> ? U : ActualReturnType<T> extends Response | Promise<Response> ? Awaited<ActualReturnType<T>> : ActualReturnType<T> : ActualReturnType<T> extends Response | Promise<Response> ? Awaited<ActualReturnType<T>> : ActualReturnType<T>;
type StaticMethodReturnPromise<T extends ControllerStaticMethod> = ToPromise<StaticMethodReturn<T>>;
type StaticMethodOptions<T extends (req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration, R, F extends VovkFetcherOptions<KnownAny>> = Partial<TFetcherOptions & {
  transform: (staticMethodReturn: T extends {
    __types: {
      iteration: infer U;
    };
  } ? unknown extends U ? Awaited<StaticMethodReturn<T>> : VovkStreamAsyncIterable<U> : Awaited<StaticMethodReturn<T>> extends JSONLinesResponder<infer U> ? VovkStreamAsyncIterable<U> : Awaited<StaticMethodReturn<T>>, resp: Response) => R;
  fetcher: VovkFetcher<F>;
}>;
type ClientMethodReturn<T extends (req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>, TStreamIteration, R> = R extends object ? Promise<Awaited<R>> : T extends {
  __types: {
    iteration: infer U;
  };
} ? unknown extends U ? StaticMethodReturnPromise<T> : Promise<VovkStreamAsyncIterable<U>> : ActualReturnType<T> extends Promise<JSONLinesResponder<infer U>> | JSONLinesResponder<infer U> | Iterator<infer U> | AsyncIterator<infer U> ? Promise<VovkStreamAsyncIterable<U>> : StaticMethodReturnPromise<T>;
type ClientMethod<T extends ((req: VovkRequest<KnownAny, KnownAny, KnownAny>, params: KnownAny) => undefined | object | JSONLinesResponder<TStreamIteration> | Promise<JSONLinesResponder<TStreamIteration>>) & {
  __types?: {
    body: KnownAny;
    query: KnownAny;
    params: KnownAny;
    output: KnownAny;
    iteration: KnownAny;
    contentType: ContentType[];
  };
}, TFetcherOptions extends Record<string, KnownAny>, TStreamIteration extends KnownAny = unknown> = (IsEmptyObject<StaticMethodInput<T>> extends true ? <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(options?: Prettify<StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R> : <R, F extends VovkFetcherOptions<KnownAny> = VovkFetcherOptions<TFetcherOptions>>(options: Prettify<StaticMethodInput<T> & StaticMethodOptions<T, TFetcherOptions, TStreamIteration, R, F>>) => ClientMethodReturn<T, TStreamIteration, R>) & {
  isRPC: true;
  schema: VovkHandlerSchema;
  controllerSchema: VovkControllerSchema;
  segmentSchema: VovkSegmentSchema;
  fullSchema: VovkSchema;
  getURL: IsEmptyObject<Pick<Prettify<StaticMethodInput<T>>, Extract<'params' | 'query', keyof Prettify<StaticMethodInput<T>>>>> extends true ? (urlInput?: {
    apiRoot?: string;
  }) => string : (urlInput: Pick<Prettify<StaticMethodInput<T>>, Extract<'params' | 'query', keyof Prettify<StaticMethodInput<T>>>> & {
    apiRoot?: string;
  }) => string;
  apiRoot: string;
  queryKey: (key?: unknown[]) => unknown[];
  __types: T['__types'];
};
type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K]; };
type VovkClientWithNever<T, TFetcherOptions extends {
  [key: string]: KnownAny;
}> = { [K in keyof T]: T[K] extends ((...args: KnownAny) => KnownAny) ? ClientMethod<T[K], TFetcherOptions> : never; };
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
      notify: "email" | "push" | "none";
    }, {
      id: string;
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
        notify: "email" | "push" | "none";
      };
      params: {
        id: string;
      };
      output: {
        success: boolean;
        id: string;
        notify: "email" | "push" | "none";
      };
      iteration: unknown;
      contentType: ["application/json"];
    };
    __handleFn: (req: VovkRequest<{
      email: string;
      profile: {
        name: string;
        age: number;
      };
    }, {
      notify: "email" | "push" | "none";
    }, {
      id: string;
    }>, params: {
      id: string;
    }) => {
      success: boolean;
      id: string;
      notify: "email" | "push" | "none";
    } | Promise<{
      success: boolean;
      id: string;
      notify: "email" | "push" | "none";
    }>;
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body?: {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        } | Blob | undefined;
        query?: {
          notify: "email" | "push" | "none";
        } | undefined;
        params?: {
          id: string;
        } | undefined;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
        transform: (data: {
          success: boolean;
          id: string;
          notify: "email" | "push" | "none";
        }, fakeReq: Pick<VovkRequest<{
          email: string;
          profile: {
            name: string;
            age: number;
          };
        }, {
          notify: "email" | "push" | "none";
        }, {
          id: string;
        }>, "vovk">) => TTransformed;
      }): Promise<TTransformed>;
      <TReturnType = {
        success: boolean;
        id: string;
        notify: "email" | "push" | "none";
      } | Promise<{
        success: boolean;
        id: string;
        notify: "email" | "push" | "none";
      }>>(input?: {
        body?: {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        } | Blob | undefined;
        query?: {
          notify: "email" | "push" | "none";
        } | undefined;
        params?: {
          id: string;
        } | undefined;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): TReturnType;
      (input?: {
        body?: {
          email: string;
          profile: {
            name: string;
            age: number;
          };
        } | Blob | undefined;
        query?: {
          notify: "email" | "push" | "none";
        } | undefined;
        params?: {
          id: string;
        } | undefined;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): {
        success: boolean;
        id: string;
        notify: "email" | "push" | "none";
      } | Promise<{
        success: boolean;
        id: string;
        notify: "email" | "push" | "none";
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
    (req: VovkRequest<unknown, unknown, unknown>, params: unknown): any;
    __types: {
      body: unknown;
      query: unknown;
      params: unknown;
      output: any;
      iteration: {
        message: string;
      };
      contentType: ["application/json"];
    };
    __handleFn: () => AsyncGenerator<{
      message: string;
    }, void, unknown>;
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
        transform: (data: AsyncGenerator<{
          message: string;
        }, void, unknown>, fakeReq: Pick<VovkRequest<unknown, unknown, unknown>, "vovk">) => TTransformed;
      }): Promise<TTransformed>;
      <TReturnType = AsyncGenerator<{
        message: string;
      }, void, unknown>>(input?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): TReturnType;
      (input?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
        meta?: Record<string, any>;
        disableClientValidation?: boolean;
      } | undefined): AsyncGenerator<{
        message: string;
      }, void, unknown>;
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
      description: string;
      license: {
        name: string;
        url: string;
      };
      version: string;
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
              type: string;
              format: string;
              pattern: string;
              description: string;
              examples: string[];
              enum?: undefined;
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
                    description: string;
                    examples: string[];
                  };
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
  validateOnClient?: VovkValidateOnClient<unknown> | Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
declare const StreamRPC: VovkRPCModule<typeof StreamController, {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<unknown> | Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
declare const OpenApiRPC: VovkRPCModule<typeof OpenApiController, {
  apiRoot?: string;
  disableClientValidation?: boolean;
  validateOnClient?: VovkValidateOnClient<unknown> | Promise<{
    validateOnClient: VovkValidateOnClient<unknown>;
  }> | undefined;
  interpretAs?: string;
  init?: RequestInit;
}>;
//#endregion
export { OpenApiRPC, StreamRPC, UserRPC, schema$1 as schema };