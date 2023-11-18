import type { _HttpStatus as HttpStatus } from './types';

export class _HttpException extends Error {
  statusCode: HttpStatus;

  message: string;

  constructor(statusCode: HttpStatus, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    throw this;
  }
}
