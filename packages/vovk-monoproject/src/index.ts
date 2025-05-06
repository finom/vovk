import { NextResponse, type NextRequest } from "next/server";

export function monoproject(segments: Record<string, string>) {
  const middleware = (request: NextRequest) => {
    // Get the host from the request headers
    const host = request.headers.get('host');
    const [segmentName, domain] = Object.entries(segments).find(([, d]) => host === d) ?? [null, null];

    // Check if the request is for foo.example.com
    if(typeof segmentName === 'string' && domain) {
      const url = request.nextUrl.clone();
      url.pathname = `/${segmentName}${url.pathname}`;
      return NextResponse.rewrite(url);
    }

    if (host === 'example.com') {
      return NextResponse.next();
    }

    // For other hosts, proceed with the original request
    return NextResponse.next();
  };

  return { middleware };
}
