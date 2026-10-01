/**
 * The error message a model or MCP client receives. As on the HTTP path, an error without a `statusCode` is internal:
 * in production its message stays on the server and the model gets a generic one.
 */
export function toModelErrorMessage(error: Error): string {
  const isExpected = typeof (error as { statusCode?: unknown }).statusCode === 'number';
  // tools also run in the browser, where `process` can be missing
  if (!isExpected && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.error('🐺 Unhandled error in a Vovk tool:', error);
    return 'Internal server error';
  }
  return error.message;
}
