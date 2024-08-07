import { _createSegment as createSegment } from './createSegment';
import {
  type _VovkConfig as VovkConfig,
  type _VovkEnv as VovkEnv,
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkRequest as VovkRequest,
  type _VovkControllerBody as VovkControllerBody,
  type _VovkControllerQuery as VovkControllerQuery,
  type _VovkControllerParams as VovkControllerParams,
  type _VovkControllerReturnType as VovkControllerReturnType,
  type _VovkControlerYieldType as VovkControlerYieldType,
  type _VovkBody as VovkBody,
  type _VovkQuery as VovkQuery,
  type _VovkParams as VovkParams,
  type _VovkReturnType as VovkReturnType,
  type _VovkYieldType as VovkYieldType,
  type _VovkMetadata as VovkMetadata,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import type {
  _VovkClientOptions as VovkClientOptions,
  _VovkClientFetcher as VovkClientFetcher,
  _VovkDefaultFetcherOptions as VovkDefaultFetcherOptions,
  _VovkValidateOnClient as VovkValidateOnClient,
} from './client/types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';
import { _StreamResponse as StreamResponse } from './StreamResponse';
import { worker } from './worker';
import { _generateStaticAPI as generateStaticAPI } from './generateStaticAPI';

export {
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkConfig,
  type VovkEnv,
  type VovkMetadata,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerReturnType,
  type VovkControlerYieldType,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  type VovkClientOptions,
  StreamResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
  worker,
  generateStaticAPI,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createSegment();
