import { headers } from 'next/headers';
import { get, prefix } from 'vovk';

@prefix()
export default class CustomerProController {
  @get()
  static async getMessage() {
    const subdomains = Object.fromEntries(
      new URLSearchParams(
        (await headers()).get('x-subdomains') ?? '',
      ).entries(),
    );
    return { message: 'Hello from the Customer Pro API', subdomains };
  }
}
