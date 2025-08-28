import type { LogLevelNames } from 'loglevel';
import type { build } from 'tsdown';
import type { VovkStrictConfig } from 'vovk';

export type VovkModuleRenderResult = {
  fileName: string;
  dir: string;
  sourceName?: string;
  compiledName?: string;
  code: string;
};

/* CLI Commands */
export interface DevOptions {
  schemaOut?: string;
  nextDev?: boolean;
  exit?: boolean;
  devHttps?: boolean;
  logLevel?: LogLevelNames;
}

export interface GenerateOptions {
  prettify?: boolean;
  configPath?: string;
  schemaPath?: string;
  origin?: string;
  openapiSpec?: string[];
  openapiGetModuleName?: string[];
  openapiGetMethodName?: string[];
  openapiRootUrl?: string[];
  openapiMixinName?: string[];
  openapiFallback?: string[];
  watch?: boolean | string;
  composedFrom?: string[];
  composedOut?: string;
  composedOnly?: boolean;
  composedIncludeSegments?: string[];
  composedExcludeSegments?: string[];
  segmentedFrom?: string[];
  segmentedOut?: string;
  segmentedOnly?: boolean;
  segmentedIncludeSegments?: string[];
  segmentedExcludeSegments?: string[];
  logLevel?: LogLevelNames;
}

export interface BundleOptions
  extends Partial<
    Pick<VovkStrictConfig['bundle'], 'prebundleOutDir' | 'keepPrebundleDir' | 'includeSegments' | 'excludeSegments'>
  > {
  configPath?: string;
  schemaPath?: string;
  schema?: string;
  outDir?: string;
  origin?: string;
  tsconfig?: string;
  openapiSpec?: string[];
  openapiGetModuleName?: string[];
  openapiGetMethodName?: string[];
  openapiRootUrl?: string[];
  openapiMixinName?: string[];
  logLevel?: LogLevelNames;
}

export interface InitOptions {
  prefix?: string;
  yes?: boolean;
  useNpm?: boolean;
  useYarn?: boolean;
  usePnpm?: boolean;
  useBun?: boolean;
  skipInstall?: boolean;
  updateTsConfig?: boolean;
  updateScripts?: 'implicit' | 'explicit';
  validationLibrary?: 'zod' | 'yup' | 'class-validator' | 'valibot' | 'arktype' | null;
  dryRun?: boolean;
  lang?: string[];
  channel?: 'latest' | 'beta' | 'draft';
  logLevel?: LogLevelNames;
}

export interface NewOptions {
  dryRun?: boolean;
  templates?: string[];
  dir?: string;
  overwrite?: boolean;
  noSegmentUpdate?: boolean;
  empty?: boolean;
  static?: boolean;
  logLevel?: LogLevelNames;
}

export type VovkEnv = {
  PORT?: string;
  VOVK_SCHEMA_OUT_DIR?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
  __VOVK_SCHEMA_OUT_FLAG__?: string;
  __VOVK_DEV_HTTPS_FLAG__?: 'true' | 'false';
  __VOVK_EXIT__?: 'true' | 'false';
  __VOVK_LOG_LEVEL__?: LogLevelNames;
};

declare global {
  var TSdownBuildOptions: Parameters<typeof build>[0];
}
