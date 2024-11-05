import { _createSegment as createSegment } from './createSegment';
import {
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkRequest as VovkRequest,
  type _VovkBody as VovkBody,
  type _VovkQuery as VovkQuery,
  type _VovkParams as VovkParams,
  type _VovkReturnType as VovkReturnType,
  type _VovkYieldType as VovkYieldType,
  type _VovkControllerBody as VovkControllerBody,
  type _VovkControllerQuery as VovkControllerQuery,
  type _VovkControllerParams as VovkControllerParams,
  type _VovkControllerReturnType as VovkControllerReturnType,
  type _VovkControllerYieldType as VovkControllerYieldType,
  type _VovkSchema as VovkSchema,
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
import { _StreamJSONResponse as StreamJSONResponse } from './StreamJSONResponse';
import { worker } from './worker';
import { _generateStaticAPI as generateStaticAPI } from './generateStaticAPI';

export {
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkSchema,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerReturnType,
  type VovkControllerYieldType,
  type VovkClientOptions,
  StreamJSONResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
  worker,
  generateStaticAPI,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createSegment();
