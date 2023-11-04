import { redirect } from 'next/navigation';
import { prefix, get } from '../../../src';

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
