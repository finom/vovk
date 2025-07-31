import type { LogLevelNames } from 'loglevel';
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
}

export interface GenerateOptions {
  prettify?: boolean;
  configPath?: string;
  schemaPath?: string;
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
}

export interface BundleOptions
  extends Partial<
    Pick<
      VovkStrictConfig['bundle'],
      'tsClientOutDir' | 'dontDeleteTsClientOutDirAfter' | 'includeSegments' | 'excludeSegments'
    >
  > {
  config?: string;
  schema?: string;
  outDir?: string;
  openapiSpec?: string[];
  openapiGetModuleName?: string[];
  openapiGetMethodName?: string[];
  openapiRootUrl?: string[];
  openapiMixinName?: string[];
}

export interface InitOptions {
  yes?: boolean;
  logLevel: LogLevelNames;
  useNpm?: boolean;
  useYarn?: boolean;
  usePnpm?: boolean;
  useBun?: boolean;
  skipInstall?: boolean;
  updateTsConfig?: boolean;
  updateScripts?: 'implicit' | 'explicit';
  validationLibrary?: string | null;
  reactQuery?: boolean;
  dryRun?: boolean;
  lang?: string[];
  channel?: 'latest' | 'beta' | 'draft';
}

export interface NewOptions {
  dryRun?: boolean;
  templates?: string[];
  dir?: string;
  overwrite?: boolean;
  noSegmentUpdate?: boolean;
  empty?: boolean;
  static?: boolean;
}

export type VovkEnv = {
  PORT?: string;
  VOVK_SCHEMA_OUT_DIR?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  VOVK_LOG_LEVEL?: LogLevelNames;
  VOVK_PRETTIFY_CLIENT?: string;
  VOVK_DEV_HTTPS?: string;
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
  __VOVK_SCHEMA_OUT_FLAG__?: string;
  __VOVK_EXIT__?: 'true' | 'false';
};
