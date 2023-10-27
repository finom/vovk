import { prefix, get, HttpException, HttpStatus } from '../../../src';

@prefix('error')
export default class ErrorController {
  @get('simple')
  static simple() {
    throw new Error('ERROR1');
  }

  @get('code')
  static code() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, prettier/prettier
    ({} as any).someMethod();
  }

  @get('http-exception')
  static httpException() {
    throw new HttpException(HttpStatus.I_AM_A_TEAPOT, 'ERROR3');
  }
}
