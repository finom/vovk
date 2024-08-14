import { LogLevelNames } from 'loglevel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KnownAny = any;

export type VovkEnv = {
  PORT?: string;
  VOVK_ROUTE?: string;
  VOVK_FETCHER?: string;
  VOVK_PREFIX?: string;
  VOVK_VALIDATE_ON_CLIENT?: string;
  VOVK_PORT?: string;
  VOVK_CLIENT_OUT?: string;
  VOVK_METADATA_OUT?: string;
  VOVK_MODULES_DIR?: string;
  __VOVK_START_SERVER__?: string;
};

export type VovkEnvNew = {
  PORT?: string;
  VOVK_CLIENT_OUT_DIR?: string;
  VOVK_METADATA_OUT_DIR?: string;
  VOVK_FETCHER?: string;
  VOVK_VALIDATE_ON_CLIENT?: string;
  VOVK_PORT?: string;
  VOVK_MODULES_DIR?: string;
  VOVK_VALIDATION_LIBRARY?: string;
  VOVK_ORIGIN?: string;
  VOVK_ROOT_ENTRY?: string;
  VOVK_API_ENTRY_POINT?: string;
  VOVK_ROOT_SEGMENT_MODULES_DIR_NAME?: string;
  VOVK_LOG_LEVEL?: LogLevelNames;
};

export type VovkConfig = {
  /** @deprecated */
  clientOut?: string;
  /** @deprecated */
  metadataOut?: string;
  /** @deprecated */
  route?: string;
  fetcher?: string;
  /** @deprecated */
  prefix?: string;
  validateOnClient?: string | null;
  modulesDir?: string;
};

export type VovkConfigNew = {
  clientOutDir?: string;
  metadataOutDir?: string;
  fetcher?: string;
  validateOnClient?: string | null;
  modulesDir?: string;
  validationLibrary?: string | null;
  rootEntry?: string;
  origin?: string;
  rootSegmentModulesDirName?: string;
  logLevel?: LogLevelNames;
};
