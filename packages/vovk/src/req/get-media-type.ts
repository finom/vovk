// type and subtype are RFC 9110 tokens
const mediaTypePattern = /^[\w!#$%&'*+.^`|~-]+\/[\w!#$%&'*+.^`|~-]+$/;

/**
 * The media type of a Content-Type header, lowercased and without parameters: "text/plain; charset=utf-8" is
 * "text/plain". Null when the header is malformed or lists several types, as "text/plain; x=1,application/json" does.
 */
export function getMediaType(contentType: string): string | null {
  let isQuoted = false;
  for (let i = 0; i < contentType.length; i++) {
    const char = contentType[i];
    if (isQuoted) {
      if (char === '\\') i++;
      else if (char === '"') isQuoted = false;
    } else if (char === '"') {
      isQuoted = true;
    } else if (char === ',') {
      return null;
    }
  }

  const mediaType = contentType.split(';')[0].trim().toLowerCase();
  return mediaTypePattern.test(mediaType) ? mediaType : null;
}
