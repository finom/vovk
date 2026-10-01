import { get } from 'vovk';

export default class AdminController {
  @get()
  static getMessage() {
    return { message: 'Hello from the Admin API', subdomains: {} };
  }
}
