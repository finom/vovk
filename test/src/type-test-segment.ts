import type { initSegment } from 'vovk';

// Type checks for the route handlers initSegment returns: the test app's tsc run fails if a line doesn't compile

type SegmentHandlers = ReturnType<typeof initSegment>;

// ====== A segment under a dynamic parent folder ======

// app/[lang]/api/[[...vovk]]/route.ts: Next.js passes the folder's param as a string next to the catch-all,
// and since 15.5 next build checks each export against this context (RouteHandlerConfig in .next/types/validator.ts)
type LangRouteHandler = (
  request: Request,
  context: { params: Promise<{ lang: string; vovk?: string[] }> }
) => Promise<Response>;

export const langSegmentHandlers = ({ GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS }: SegmentHandlers) =>
  [GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS] satisfies LangRouteHandler[];
