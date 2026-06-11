import { NextResponse } from 'next/server.js';
import { get, prefix } from 'vovk';

@prefix('next-response')
export default class NextResponseController {
  @get()
  static get() {
    return NextResponse.json({ hello: 'world' });
  }

  @get('response-object')
  static responseObject() {
    return new Response(JSON.stringify({ hello: 'world2' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
