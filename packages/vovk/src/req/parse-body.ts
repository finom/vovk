import { HttpException } from '../core/http-exception.js';
import { HttpStatus } from '../types/enums.js';
import { bufferBody } from './buffer-body.js';
import { getMediaType } from './get-media-type.js';
import { parseForm } from './parse-form.js';

const formTypes = ['multipart/form-data', 'application/x-www-form-urlencoded'];

/** Application MIME types that are parsed as text by parseBody. */
export const textTypes = [
  'application/xml',
  'application/xhtml+xml',
  'application/javascript',
  'application/x-javascript',
  'application/ecmascript',
  'application/yaml',
  'application/x-yaml',
  'application/graphql',
  'application/sql',
  'application/toml',
  'application/x-ndjson',
  'application/ndjson',
  'application/jsonl',
  'application/jsonlines',
  'application/x-jsonlines',
] as const;

export const textSuffixPattern = /\+(xml|text|yaml|json-seq)$/;

// the name in a Content-Disposition header: filename* (RFC 8187) holds it in UTF-8, filename an ASCII fallback,
// which is what fileNameToDisposition() writes
function getFileName(disposition: string): string | undefined {
  const encoded = disposition.match(/(?:^|;)\s*filename\*\s*=\s*utf-8'[^';]*'([^;\s]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      // a malformed escape, the fallback follows
    }
  }
  const [, quoted, token] = disposition.match(/(?:^|;)\s*filename\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^;\s]+))/i) ?? [];
  return quoted?.replace(/\\(.)/g, '$1') ?? token;
}

export async function parseBody(
  req: Request
): Promise<Record<string, unknown> | FormData | URLSearchParams | string | File> {
  const contentType = req.headers?.get('content-type');
  const mediaType = contentType ? getMediaType(contentType) : null;

  if (contentType && !mediaType) {
    throw new HttpException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, `Unsupported media type: ${contentType}`);
  }

  // every reader shares one copy: a decorator or onBefore may read the body before a procedure validates it
  await bufferBody(req);

  if (!mediaType || mediaType === 'application/json' || mediaType.endsWith('+json')) {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (e) {
      if (e instanceof SyntaxError) throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid JSON body: ${e.message}`);
      throw e;
    }
    req.json = () => Promise.resolve(body);
    return body;
  }

  if (formTypes.includes(mediaType)) {
    let body: FormData;
    try {
      body = await req.formData();
    } catch (e) {
      // a body that doesn't match its form type, e.g. a multipart body without its boundary
      if (e instanceof TypeError) throw new HttpException(HttpStatus.BAD_REQUEST, `Invalid form body: ${e.message}`);
      throw e;
    }
    req.formData = () => Promise.resolve(body);
    return parseForm(body);
  }

  if (
    mediaType.startsWith('text/') ||
    (textTypes as readonly string[]).includes(mediaType) ||
    textSuffixPattern.test(mediaType)
  ) {
    const body = await req.text();
    req.text = () => Promise.resolve(body);
    return body;
  }

  const fileName = getFileName(req.headers?.get('content-disposition') ?? '') || 'file';
  const body = await req.blob();
  req.blob = () => Promise.resolve(body);
  return new File([body], fileName, { type: contentType ?? undefined });
}
