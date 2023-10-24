import createController from './createController';
import { type ErrorResponseBody, HttpStatus } from './types';
import HttpException from './HttpException';

export { type ErrorResponseBody, HttpException, HttpStatus, createController };

export const { get, post, put, patch, del, head, options, prefix, RouteHandlers } = createController();
