import { HttpStatus } from './types';

export default class HttpException extends Error {
  status: HttpStatus;

  message: string;

  constructor(status: HttpStatus, message: string) {
    super(message);
    this.status = status;
    this.message = message;

    throw this;
  }
}
