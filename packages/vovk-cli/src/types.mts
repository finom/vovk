import type { LogLevelNames } from 'loglevel';

export type VovkModuleRenderResult = {
  fileName: string;
  dir: string;
  sourceName?: string;
  compiledName?: string;
  code: string;
};

/* CLI Commands */
export interface DevOptions {
  nextDev?: boolean;
  exit?: boolean;
}

export interface GenerateOptions {
  prettify?: boolean;
  config?: string;
  fullClientFrom?: string[];
  fullClientOut?: string;
  segmentedClientFrom?: string[];
  segmentedClientOut?: string;
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
  channel?: 'latest' | 'beta' | 'draft';
}

export interface NewOptions {
  dryRun?: boolean;
  templates?: string[];
  dir?: string;
  overwrite?: boolean;
  noSegmentUpdate?: boolean;
  empty?: boolean;
}

export type VovkEnv = {
  // TODO: cover fromTemplates and outDir for segmentedClient and fullClient
  PORT?: string;
  VOVK_SCHEMA_OUT_DIR?: string;
  VOVK_IMPORTS_FETCHER?: string;
  VOVK_IMPORTS_VALIDATE_ON_CLIENT?: string;
  VOVK_IMPORTS_CREATE_RPC?: string;
  VOVK_MODULES_DIR?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  VOVK_ROOT_SEGMENT_MODULES_DIR_NAME?: string;
  VOVK_LOG_LEVEL?: LogLevelNames;
  VOVK_PRETTIFY_CLIENT?: string;
  VOVK_DEV_HTTPS?: string;
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
  __VOVK_EXIT__?: 'true' | 'false';
};
