import { _createSegment as createSegment } from './createSegment';
import {
  type _VovkConfig as VovkConfig,
  type _VovkEnv as VovkEnv,
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkRequest as VovkRequest,
  type _VovkBody as VovkBody,
  type _VovkQuery as VovkQuery,
  type _VovkParams as VovkParams,
  type _VovkReturnType as VovkReturnType,
  type _VovkYieldType as VovkYieldType,
  type _VovkClientBody as VovkClientBody,
  type _VovkClientQuery as VovkClientQuery,
  type _VovkClientParams as VovkClientParams,
  type _VovkClientReturnType as VovkClientReturnType,
  type _VovkClientYieldType as VovkClientYieldType,
  type _VovkMetadata as VovkMetadata,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import { _VovkClientOptions as VovkClientOptions } from './client/types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';
import { _StreamResponse as StreamResponse } from './StreamResponse';
import { worker } from './worker';

export {
  type VovkConfig,
  type VovkEnv,
  type VovkMetadata,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  type VovkClientBody,
  type VovkClientQuery,
  type VovkClientParams,
  type VovkClientReturnType,
  type VovkClientYieldType,
  type VovkClientOptions,
  StreamResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
  worker,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createSegment();
