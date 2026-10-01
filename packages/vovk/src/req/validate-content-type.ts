import { HttpException } from '../core/http-exception.js';
import { HttpStatus } from '../types/enums.js';
import { getMediaType } from './get-media-type.js';

export function validateContentType(request: Request | undefined, allowed: string[]): Response | null {
  // wildcard, skip validation
  if (!request?.headers || allowed.includes('*/*')) return null;

  const raw = request.headers.get('content-type');

  if (!raw) {
    throw new HttpException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'Missing Content-Type header', { allowed });
  }

  // one media type: a list such as "text/plain; x=1,application/json" passes a browser's CORS check as text/plain
  const mediaType = getMediaType(raw);

  const match =
    mediaType !== null &&
    allowed.some((pattern) => {
      const normalized = pattern.toLowerCase();

      // Partial wildcard: image/*, text/*, etc.
      if (normalized.endsWith('/*')) {
        const prefix = normalized.slice(0, -1);
        return mediaType.startsWith(prefix);
      }

      return mediaType === normalized;
    });

  if (!match) {
    const contentType = mediaType ?? raw;
    throw new HttpException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, `Unsupported media type: ${contentType}`, {
      contentTypes: [contentType],
      allowed,
    });
  }

  return null;
}
