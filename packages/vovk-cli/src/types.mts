import { LogLevelNames } from 'loglevel';

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
  __VOVK_START_WATCHER_IN_STANDALONE_MODE__?: 'true';
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
  custom?: KnownAny;
  templates?: {
    service?: string;
    controller?: string;
    worker?: string;
    [key: string]: string | undefined;
  };
};
