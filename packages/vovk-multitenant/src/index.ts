import { NextResponse, type NextRequest } from 'next/server';

export function multitenant({
  isEnabled,
  config,
}: {
  isEnabled: boolean;
  config: Record<string, { origin: string; rootEntry: string }>;
}) {
  // Create a reverse mapping from origins to segments
  const originToSegment: Record<string, string> = {};
  for (const [segment, { origin }] of Object.entries(config)) {
    originToSegment[origin] = segment;
  }

  const middleware = (request: NextRequest) => {
    if (!isEnabled) {
      return NextResponse.next();
    }
    const url = new URL(request.url);
    const { pathname, origin } = url;

    console.log(origin, originToSegment, config);

    // Check if the current origin is in our mapping
    if (origin in originToSegment) {
      const currentSegmentName = originToSegment[origin];

      // Check for redirects to more specific origins
      for (const [segmentName, { origin: targetOrigin }] of Object.entries(config)) {
        // Skip current origin's segment
        if (segmentName === currentSegmentName) continue;

        // If this is a more specific segment that extends our current segment
        if (currentSegmentName === '' || segmentName.startsWith(`${currentSegmentName}/`)) {
          // Get the next part in the path hierarchy
          const nextPart = segmentName
            .slice(currentSegmentName === '' ? 0 : currentSegmentName.length + 1)
            .split('/')[0];

          // If the pathname starts with this next part, redirect to the more specific origin
          if (pathname === `/${nextPart}` || pathname.startsWith(`/${nextPart}/`)) {
            const newPath = pathname.slice(nextPart.length + 1) || '/';
            return NextResponse.redirect(new URL(`${targetOrigin}${newPath}`));
          }
        }
      }

      // No redirect needed, rewrite the URL to add the segment prefix
      return NextResponse.rewrite(new URL(`${origin}/${currentSegmentName}${pathname}`));
    }

    // If hostname doesn't match any of our origins, continue
    return NextResponse.next();
  };

  return { middleware };
}
