import { get } from 'vovk';

export default class RootController {
  @get()
  static getMessage() {
    return { message: 'Hello from the Root API', subdomains: {} };
  }
}
