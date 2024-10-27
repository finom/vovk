import { prefix, get, HttpException, HttpStatus } from '../../../packages/vovk';

@prefix('error')
export default class ErrorController {
  @get('simple')
  static simple() {
    throw new Error('ERROR1');
  }

  @get('code')
  static code() {
    ({} as { someMethod: () => void }).someMethod();
  }

  @get('http-exception')
  static httpException() {
    throw new HttpException(HttpStatus.I_AM_A_TEAPOT, 'ERROR3');
  }
}
