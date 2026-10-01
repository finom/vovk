import type { VovkErrorResponse } from '../types/core.js';
import type { HttpStatus } from '../types/enums.js';

// Symbol.for, so an exception from another copy of the package carries the same brand
const HTTP_EXCEPTION_BRAND = Symbol.for('vovk.HttpException');

/**
 * HTTP exception with a status code and message.
 * @example
 * ```ts
 * throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid request data');
 * ```
 */
export class HttpException extends Error {
  statusCode: HttpStatus;

  message: string;

  cause?: unknown;

  constructor(statusCode: HttpStatus, message: string, cause?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.cause = cause;
  }

  toJSON(): VovkErrorResponse {
    return {
      isError: true,
      statusCode: this.statusCode,
      message: this.message,
      ...(this.cause ? { cause: this.cause } : {}),
    };
  }
}

Object.defineProperty(HttpException.prototype, HTTP_EXCEPTION_BRAND, { value: true });

// any other error is internal, even one with a numeric statusCode, such as a third-party SDK error
export function isHttpException(error: unknown): error is HttpException {
  return (
    error instanceof HttpException ||
    (typeof error === 'object' && error !== null && (error as Record<symbol, unknown>)[HTTP_EXCEPTION_BRAND] === true)
  );
}
