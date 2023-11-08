import type { HttpStatus } from './types';

export default class HttpException extends Error {
  statusCode: HttpStatus;

  message: string;

  constructor(statusCode: HttpStatus, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    throw this;
  }
}
