import { _createSegment as createSegment } from './createSegment';
import {
  type _ErrorResponseBody as ErrorResponseBody,
  _HttpStatus as HttpStatus,
  _HttpMethod as HttpMethod,
} from './types';
import { _HttpException as HttpException } from './HttpException';
import { _createDecorator as createDecorator } from './createDecorator';

export { type ErrorResponseBody, HttpException, HttpStatus, HttpMethod, createSegment, createDecorator };

export const { get, post, put, patch, del, head, options, prefix, activateControllers } = createSegment();
