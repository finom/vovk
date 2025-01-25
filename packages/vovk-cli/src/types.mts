import type { LogLevelNames } from 'loglevel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KnownAny = any;

export type VovkEnv = {
  PORT?: string;
  VOVK_CLIENT_OUT_DIR?: string;
  VOVK_SCHEMA_OUT_DIR?: string;
  VOVK_FETCHER?: string;
  VOVK_VALIDATE_ON_CLIENT?: string;
  VOVK_MODULES_DIR?: string;
  VOVK_VALIDATION_LIBRARY?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  VOVK_ROOT_SEGMENT_MODULES_DIR_NAME?: string;
  VOVK_LOG_LEVEL?: LogLevelNames;
  VOVK_PRETTIFY_CLIENT?: string;
  VOVK_DEV_HTTPS?: string;
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
  __VOVK_THEN_KILL__?: 'true' | 'false';
};

export type VovkConfig = {
  clientOutDir?: string;
  schemaOutDir?: string;
  fetcher?: string;
  validateOnClient?: string | null;
  modulesDir?: string;
  validationLibrary?: string | null;
  rootEntry?: string;
  origin?: string;
  rootSegmentModulesDirName?: string;
  logLevel?: LogLevelNames;
  prettifyClient?: boolean;
  devHttps?: boolean;
  experimental_clientGenerateTemplateNames?: string[];
  templates?: {
    service?: string;
    controller?: string;
    worker?: string;
    [key: string]: string | undefined;
  };
};

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
  thenKill?: boolean;
}

export interface GenerateOptions {
  clientOutDir?: string;
  templates?: string[];
  prettify?: boolean;
  fullSchema?: string | boolean;
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
  validateOnClient?: boolean;
  dryRun?: boolean;
  channel?: 'latest' | 'beta' | 'draft';
}

export interface NewOptions {
  dryRun?: boolean;
  templates?: string[];
  dir?: string;
  overwrite?: boolean;
  noSegmentUpdate?: boolean;
}
