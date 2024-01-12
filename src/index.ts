import { _createSegment as createSegment, _writeMetadata as writeMetadata } from './createSegment';
import {
  type _VovkErrorResponse as VovkErrorResponse,
  type _VovkRequest as VovkRequest,
  type _VovkBody as VovkBody,
  type _VovkQuery as VovkQuery,
  type _VovkParams as VovkParams,
  type _VovkReturnType as VovkReturnType,
  type _VovkMetadata as VovkMetadata,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';

export {
  type VovkMetadata,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
  writeMetadata,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createSegment();
