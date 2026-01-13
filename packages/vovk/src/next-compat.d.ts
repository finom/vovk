declare module 'next/server.js' {
  // Fallback: if Next.js isn't installed, this provides a "null" type
  export interface NextResponse<T = unknown> {}
}