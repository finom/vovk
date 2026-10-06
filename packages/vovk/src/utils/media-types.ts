// the Python and Rust clients keep the same list
export const JSON_LINES_MEDIA_TYPES = ['application/jsonl', 'application/jsonlines', 'application/x-ndjson'];

export const FORM_MEDIA_TYPES = ['multipart/form-data', 'application/x-www-form-urlencoded'];

export const isJSONMediaType = (mediaType: string) => mediaType === 'application/json' || mediaType.endsWith('+json');

const matchesMediaType = (mediaType: string, pattern: string) =>
  pattern === '*/*' || (pattern.endsWith('/*') ? mediaType.startsWith(pattern.slice(0, -1)) : mediaType === pattern);

// a typed Blob or File keeps its own type; untyped bytes go out as the Python and Rust clients send them
export function getBinaryContentType(ownType: string, declared: string[]) {
  const takes = (mediaType: string) =>
    !declared.length || declared.some((pattern) => matchesMediaType(mediaType, pattern));
  if (ownType) {
    if (takes(ownType.split(';')[0].trim().toLowerCase())) return ownType;
    // application/octet-stream takes any file; another type goes out as it is, for the server to refuse
    return declared.includes('application/octet-stream') ? 'application/octet-stream' : ownType;
  }
  // the first declared type that isn't JSON or a form, such as image/png, then a wildcard such as image/*
  const binaryType =
    declared.find((type) => !type.includes('*') && !FORM_MEDIA_TYPES.includes(type) && !isJSONMediaType(type)) ??
    declared.find((type) => type !== '*/*' && type.endsWith('/*'));
  if (binaryType) return binaryType;
  if (takes('application/octet-stream')) return 'application/octet-stream';
  // a procedure that takes only JSON or a URL-encoded form parses the bytes as that
  return (
    declared.find((type) => isJSONMediaType(type) || type === 'application/x-www-form-urlencoded') ??
    'application/octet-stream'
  );
}
