import { cookies } from 'next/headers';
import { get } from 'vovk';

export default class CustomerController {
  @get()
  static async getMessage() {
    const subdomains = Object.fromEntries(
      new URLSearchParams(
        (await cookies()).get('x-subdomains')?.value ?? '',
      ).entries(),
    );

    return { message: 'Hello from the Customer API', subdomains };
  }
}
