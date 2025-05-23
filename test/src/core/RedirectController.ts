import { redirect } from 'next/navigation.js';
import { prefix, get } from 'vovk';

@prefix('redirect')
export default class RedirectController {
  @get('from')
  static from() {
    redirect('/api/redirect/to');
  }

  @get('to')
  static to() {
    return { redirected: true };
  }
}
