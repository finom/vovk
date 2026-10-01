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

const parseJSON = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/** What an error Response says went wrong: a JSON body's message, detail or title, else the body text. */
export async function responseErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  const mediaType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  if (mediaType === 'application/json' || mediaType.endsWith('+json')) {
    const body = parseJSON(text) as { message?: unknown; detail?: unknown; title?: unknown } | null;
    const message = body?.message ?? body?.detail ?? body?.title;
    if (typeof message === 'string') return message;
  }
  return text || `Request failed with status ${response.status}`;
}
