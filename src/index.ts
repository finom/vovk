import createController from './createController';
import { type ErrorResponseBody, HttpStatus } from './types';
import HttpException from './HttpException';
import createDecorator from './createDecorator';

export { type ErrorResponseBody, HttpException, HttpStatus, createController, createDecorator };

export const { get, post, put, patch, del, head, options, prefix, RouteHandlers } = createController();
