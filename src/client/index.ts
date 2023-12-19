import { _clientizeController as clientizeController } from './clientizeController';
import type { _VovkClientFetcher as VovkClientFetcher, _VovkClientOptions as VovkClientOptions } from './types';
import {
  type _DefaultFetcherOptions as DefaultFetcherOptions,
  _defaultFetcher as defaultFetcher,
} from './defaultFetcher';

export { clientizeController, defaultFetcher };
export type { VovkClientFetcher, VovkClientOptions, DefaultFetcherOptions };
