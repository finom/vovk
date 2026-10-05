import { type NextRequest, NextResponse } from 'next/server';
import { multitenant } from 'vovk';

export default function proxy(request: NextRequest) {
  const { action, destination, message, subdomains } = multitenant({
    requestUrl: request.url,
    requestHost: request.headers.get('host') ?? '',
    targetHost: process.env.VERCEL ? 'multitenant.vovk.dev' : 'localhost:3000',
    overrides: {
      admin: [
        { from: 'api', to: 'api/admin' }, // API
        { from: '', to: 'admin' }, // UI
      ],
      customer: [
        { from: 'api', to: 'api/customer' }, // API
        { from: '', to: 'customer' }, // UI
      ],
      '[customer_name].customer': [
        { from: 'api', to: 'api/customer' }, // API
        { from: '', to: 'customer/[customer_name]' }, // UI
      ],
      'pro.[customer_name].customer': [
        { from: 'api', to: 'api/customer/pro' }, // API
        { from: '', to: 'customer/[customer_name]/pro' }, // UI
      ],
    },
  });

  console.log({
    requestUrl: request.url,
    requestHost: request.headers.get('host') ?? '',
    targetHost: process.env.VERCEL ? 'multitenant.vovk.dev' : 'localhost:3000',
    action,
    destination,
    message,
    subdomains,
  });

  // the API reads the tenant from this header; only the proxy sets it, not the client
  const headers = new Headers(request.headers);
  headers.delete('x-subdomains');
  if (subdomains) {
    headers.set('x-subdomains', new URLSearchParams(subdomains).toString());
  }

  if (action === 'rewrite' && destination) {
    return NextResponse.rewrite(new URL(destination), { request: { headers } });
  }
  if (action === 'redirect' && destination) {
    return NextResponse.redirect(new URL(destination));
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - SVG files
     */
    '/((?!static|.*\\.png|.*\\.svg|.*\\.ico|.well-known|_next/image|_next/static).*)',
  ],
};
