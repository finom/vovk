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

  let res: NextResponse;
  if (action === 'rewrite' && destination) {
    res = NextResponse.rewrite(new URL(destination));
  } else if (action === 'redirect' && destination) {
    res = NextResponse.redirect(new URL(destination));
  } else {
    res = NextResponse.next();
  }

  // not the best solution, but I couldn't find a better one
  if (subdomains) {
    res.cookies.set(
      'x-subdomains',
      new URLSearchParams(subdomains).toString(),
      { expires: new Date(Date.now() + 3e3) },
    );
  }

  return res;
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
