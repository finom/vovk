import { NextResponse, type NextRequest } from "next/server";
/**
Prompt:
I need you to implement monoproject function that returns Next.js middleware function. The main function accepts an object of segment-domain pairs, where the keys are the hyerarchical segments and the values are the domains. The middleware function should redirect or rewrite requests based on the provided segments and domains. The goal is to build a monoproject that uses single next.js app to serve multiple domains with different segments.

Use NextResponse.rewrite and NextResponse.redirect to handle the rewrites and redirects. If the request is not for a segment, return NextResponse.next() to continue processing the request as normal.

example:

export const { middleware } = monoproject({
  'foo/bar/baz': 'd.example.com',
  'foo/bar': 'c.example.com',
  'foo': 'b.example.com',
  '': 'a.example.com',
});

c.example.com/baz -> REDIRECT d.example.com
b.example.com/bar -> REDIRECT c.example.com
a.example.com/foo -> REDIRECT b.example.com

a.example.com/foo -> REWRITE /foo/
b.example.com/bar -> REWRITE /foo/bar/
c.example.com/baz -> REWRITE /foo/bar/baz/

 */

export function monoproject(segments: Record<string, string>) {
  // Create a reverse mapping from origins to segments
  const originToSegment: Record<string, string> = {};
  for (const [segment, origin] of Object.entries(segments)) {
    originToSegment[origin] = segment;
  }

  const middleware = (request: NextRequest) => {
    const url = new URL(request.url);
    const { pathname, origin, host } = url;
    
    // Check if the current origin is in our mapping
    if (host in originToSegment) {
      const currentSegment = originToSegment[host];
      
      // Check for redirects to more specific origins
      for (const [segment, targetOrigin] of Object.entries(segments)) {
        // Skip current origin's segment
        if (segment === currentSegment) continue;
        
        // If this is a more specific segment that extends our current segment
        if (currentSegment === '' || segment.startsWith(`${currentSegment}/`)) {
          // Get the next part in the path hierarchy
          const nextPart = segment.slice(
            currentSegment === '' ? 0 : currentSegment.length + 1
          ).split('/')[0];
          
          // If the pathname starts with this next part, redirect to the more specific origin
          if (pathname === `/${nextPart}` || pathname.startsWith(`/${nextPart}/`)) {
            const newPath = pathname.slice(nextPart.length + 1) || '/';
            return NextResponse.redirect(new URL(`${targetOrigin}${newPath}`));
          }
        }
      }
      
      // No redirect needed, rewrite the URL to add the segment prefix
      return NextResponse.rewrite(new URL(`${origin}/${currentSegment}${pathname}`));
    }
    
    // If hostname doesn't match any of our origins, continue
    return NextResponse.next();
  };

  return { middleware };
}

