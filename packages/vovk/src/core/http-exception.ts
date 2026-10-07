import type { VovkErrorResponse } from '../types/core.js';
import { HttpStatus } from '../types/enums.js';

// Symbol.for, so an exception from another copy of the package carries the same brand
const HTTP_EXCEPTION_BRAND = Symbol.for('vovk.HttpException');
// a response sends it in place of the error's cause, which stays on the server, as a validation error's trimmed issues
const RESPONSE_CAUSE = Symbol.for('vovk.responseCause');

export function withResponseCause<T extends Error>(error: T, cause: unknown): T {
  Object.defineProperty(error, RESPONSE_CAUSE, { value: cause });
  return error;
}

export function getResponseCause(error: unknown): unknown {
  if (typeof error === 'object' && error !== null && RESPONSE_CAUSE in error) {
    return (error as Record<symbol, unknown>)[RESPONSE_CAUSE];
  }
  return (error as { cause?: unknown } | null | undefined)?.cause;
}

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
    const cause = getResponseCause(this);
    return {
      isError: true,
      statusCode: this.statusCode,
      message: this.message,
      ...(cause ? { cause } : {}),
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

// Response takes an integer status from 200 to 599; an error with any other status, as "400" or 999, answers 500
export function toResponseStatus(statusCode: unknown): HttpStatus {
  return Number.isInteger(statusCode) && (statusCode as number) >= 200 && (statusCode as number) <= 599
    ? (statusCode as HttpStatus)
    : HttpStatus.INTERNAL_SERVER_ERROR;
}
