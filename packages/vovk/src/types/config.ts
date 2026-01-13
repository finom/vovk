import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { PackageJson } from './package.js';
import type { HttpMethod, VovkSchemaIdEnum } from './enums.js';
import type { VovkOperationObject } from './operation.js';
import type { KnownAny, RequireFields } from './utils.js';

export type VovkPackageJson = PackageJson & {
  rs_name?: string;
  py_name?: string;
};

export type VovkReadmeConfig = {
  banner?: string;
  installCommand?: string;
  description?: string;
};

export type VovkSamplesConfig = {
  apiRoot?: string;
  headers?: Record<string, string>;
};

type IncludeExcludeSegments =
  | {
      excludeSegments?: never;
      includeSegments?: string[];
    }
  | {
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

export type VovkBundleConfig = {
  requires?: Record<string, string>;
  prebundleOutDir?: string;
  keepPrebundleDir?: boolean;
  outDir?: string;
  build: (options: { outDir: string; prebundleDir: string; entry: string }) => Promise<void>;
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

export interface VovkOutputConfig<TImports extends GeneratorConfigImports = GeneratorConfigImports> {
  origin?: string | null;
  package?: VovkPackageJson;
  readme?: VovkReadmeConfig;
  samples?: VovkSamplesConfig;
  openAPIObject?: Partial<OpenAPIObject>;
  reExports?: Record<string, string>;
  imports?: TImports;
}

export type ClientTemplateDef = {
  extends?: string;
  templatePath?: string | null;
  composedClient?: Omit<ClientConfigComposed, 'fromTemplates' | 'enabled'>;
  segmentedClient?: Omit<ClientConfigSegmented, 'fromTemplates' | 'enabled'>;
  requires?: Record<string, string>;
  outputConfig?: VovkOutputConfig<GeneratorConfigImports>;
};

export type GetOpenAPINameFn = (config: {
  operationObject: VovkOperationObject;
  method: HttpMethod;
  path: string;
  openAPIObject: OpenAPIObject;
}) => string;

export interface VovkOpenAPIMixin {
  source:
    | {
        file: string;
      }
    | {
        url: string;
        fallback?: string;
      }
    | {
        object: OpenAPIObject;
      };
  apiRoot?: string;
  getModuleName?: // if not provided, will use 'api' by default
    | 'nestjs-operation-id' // UserController from 'UserController_getUser' operation ID
    | (string & {}) // literal module name, like MedusaRPC, GithubReposRPC, etc.
    | 'api' // declared for documentation purposes as default
    | GetOpenAPINameFn;
  getMethodName?: // if not provided, will use 'camel-case-operation-id' if operationId is snake_case, in other cases will use 'auto' strategy
    | 'nestjs-operation-id' // getUser from 'UserController_getUser' operation ID
    | 'camel-case-operation-id' // operation ID to camelCase
    | 'auto' // auto-detect based on operationObject method and path
    | GetOpenAPINameFn;
  errorMessageKey?: string;
  mixinName?: string;
}

export interface VovkOpenAPIMixinNormalized extends Omit<
  VovkOpenAPIMixin,
  'source' | 'getMethodName' | 'getModuleName'
> {
  source: Exclude<
    NonNullable<VovkOpenAPIMixin['source']>,
    { file: string } | { url: string } // "object" only
  >;
  getMethodName: GetOpenAPINameFn;
  getModuleName: GetOpenAPINameFn;
}

export interface VovkSegmentConfig extends VovkOutputConfig<SegmentConfigImports> {
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
    ajv?: KnownAny; // set by providing the typedoc comment in config
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

/**
 * The user configuration for Vovk.ts
 * @see https://vovk.dev/config
 */
export type VovkConfig = VovkUserConfig;

export type VovkStrictConfig = Required<
  Omit<VovkUserConfig, 'exposeConfigKeys' | 'libs' | 'composedClient' | 'segmentedClient' | 'bundle'>
> & {
  exposeConfigKeys: (keyof VovkStrictConfig | string)[];
  bundle: Required<Omit<NonNullable<VovkUserConfig['bundle']>, 'includeSegments' | 'excludeSegments'>> &
    IncludeExcludeSegments;
  libs: Record<string, KnownAny>;
  composedClient: RequireFields<ClientConfigComposed, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  segmentedClient: RequireFields<ClientConfigSegmented, 'enabled' | 'fromTemplates' | 'outDir' | 'prettifyClient'>;
  outputConfig: VovkOutputConfig<GeneratorConfigImports> & {
    segments?: Record<string, Omit<VovkSegmentConfig, 'openAPIMixin'> & { openAPIMixin?: VovkOpenAPIMixinNormalized }>;
  };
};
