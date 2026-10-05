import { headers } from 'next/headers';
import { get } from 'vovk';

export default class CustomerController {
  @get()
  static async getMessage() {
    const subdomains = Object.fromEntries(
      new URLSearchParams(
        (await headers()).get('x-subdomains') ?? '',
      ).entries(),
    );

    return { message: 'Hello from the Customer API', subdomains };
  }
}
