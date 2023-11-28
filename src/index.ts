import { _createSegment as createSegment } from './createSegment';
import {
  type _ErrorResponseBody as ErrorResponseBody,
  type _SmoothieRequest as SmoothieRequest,
  type _SmoothieBody as SmoothieBody,
  type _SmoothieQuery as SmoothieQuery,
  type _SmoothieParams as SmoothieParams,
  type _SmoothieReturnType as SmoothieReturnType,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';
import { _StreamResponse as StreamResponse } from './StreamResponse';

export {
  type ErrorResponseBody,
  type SmoothieRequest,
  type SmoothieBody,
  type SmoothieQuery,
  type SmoothieParams,
  type SmoothieReturnType,
  HttpException,
  HttpStatus,
  HttpMethod,
  createSegment,
  createDecorator,
  StreamResponse,
};

export const { get, post, put, patch, del, head, options, prefix, activateControllers } = createSegment();
