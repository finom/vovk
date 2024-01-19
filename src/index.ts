import { _createSegment as createSegment } from './createSegment';
import {
  type _VovkRc as VovkRc,
  type _VovkEnv as VovkEnv,
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkRequest as VovkRequest,
  type _VovkBody as VovkBody,
  type _VovkQuery as VovkQuery,
  type _VovkParams as VovkParams,
  type _VovkReturnType as VovkReturnType,
  type _VovkClientBody as VovkClientBody,
  type _VovkClientQuery as VovkClientQuery,
  type _VovkClientParams as VovkClientParams,
  type _VovkClientReturnType as VovkClientReturnType,
  type _VovkMetadata as VovkMetadata,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';

export {
  type VovkRc,
  type VovkEnv,
  type VovkMetadata,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkClientBody,
  type VovkClientQuery,
  type VovkClientParams,
  type VovkClientReturnType,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createSegment();
