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
  clientOutDir?: string;
  templates?: string[];
  prettify?: boolean;
  emitFullSchema?: string | boolean;
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
