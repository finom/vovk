import type { HttpStatus } from './types';

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
}
