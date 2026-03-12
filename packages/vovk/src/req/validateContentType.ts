import { HttpException } from '../core/HttpException.js';
import { HttpStatus } from '../types/enums.js';

export function validateContentType(request: Request | undefined, allowed: string[]): Response | null {
  // Wildcard — skip validation
  if (!request?.headers || allowed.includes('*/*')) return null;

  const raw = request.headers.get('content-type');

  if (!raw) {
    throw new HttpException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'Missing Content-Type header', { allowed });
  }

  // Handle comma-separated content types and strip parameters like charset, boundary
  const contentTypes = raw
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase())
    .filter(Boolean);

  const match = contentTypes.some((contentType) =>
    allowed.some((pattern) => {
      const normalized = pattern.toLowerCase();

      // Partial wildcard: image/*, text/*, etc.
      if (normalized.endsWith('/*')) {
        const prefix = normalized.slice(0, -1);
        return contentType.startsWith(prefix);
      }

      return contentType === normalized;
    })
  );

  if (!match) {
    throw new HttpException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, `Unsupported media type: ${contentTypes.join(', ')}`, {
      contentTypes,
      allowed,
    });
  }

  return null;
}
