import type { HttpStatus, VovkErrorResponse } from '../types';

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
