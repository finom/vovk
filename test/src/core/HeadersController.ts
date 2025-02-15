import { headers } from 'next/headers';
import { get, prefix } from 'vovk';

@prefix('headers')
export default class HeadersController {
  @get()
  static async get() {
    const headerList = await headers();
    const hello = headerList.get('x-hello-header');

    return { hello };
  }

  @get('decorator-header', { headers: { 'x-decorator-header': 'hello' } })
  static getWithHeader() {
    return {};
  }
}
