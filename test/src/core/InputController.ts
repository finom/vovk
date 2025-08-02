import { NextRequest } from 'next/server.js';
import { prefix, post } from 'vovk';

@prefix('input')
export default class InputController {
  @post('foo/{a}/{b}/bar/{c}')
  static async getFooBar(req: NextRequest, { a, b, c }: { a: string; b: string; c: string }) {
    const body: unknown = await req.json();
    const q1 = req.nextUrl.searchParams.get('q1');
    const q2 = req.nextUrl.searchParams.get('q2');
    return { a, b, c, q1, q2, body };
  }
}
