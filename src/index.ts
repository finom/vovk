import createSegment from './createSegment';
import { type ErrorResponseBody, HttpStatus } from './types';
import HttpException from './HttpException';
import createDecorator from './createDecorator';

export { type ErrorResponseBody, HttpException, HttpStatus, createSegment, createDecorator };

export const { get, post, put, patch, del, head, options, prefix, activateControllers } = createSegment();
