import type { HttpStatus, VovkErrorResponse } from '../types.js';

/**
 * Represents an HTTP exception with a status code and message.
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
