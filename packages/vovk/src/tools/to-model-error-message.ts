import { isHttpException } from '../core/http-exception.js';

/**
 * The error message a model or MCP client receives. As on the HTTP path, an error that is not an `HttpException` is
 * internal: in production its message stays on the server and the model gets a generic one.
 */
export function toModelErrorMessage(error: Error): string {
  // tools also run in the browser, where `process` can be missing
  if (!isHttpException(error) && typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.error('🐺 Unhandled error in a Vovk tool:', error);
    return 'Internal server error';
  }
  return error.message;
}
