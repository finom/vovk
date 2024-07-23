import { headers } from 'next/headers';
import { get, prefix } from '../../../packages/vovk';

@prefix('headers')
export default class HeadersController {
  @get()
  static get() {
    const headersList = headers();
    const hello = headersList.get('x-hello-header');

    return { hello };
  }

  @get('decorator-header', { headers: { 'x-decorator-header': 'hello' } })
  static getWithHeader() {
    return {};
  }
}
