import type { KnownAny } from '../types/utils.js';

// recursively builds "key=value" strings, key grows like 'user', 'user[0]', 'user[0][name]'
function buildParams(key: string, value: KnownAny): string[] {
  if (value === null || value === undefined) {
    return []; // skip null/undefined values entirely
  }

  // If value is an object or array, we need to recurse
  if (typeof value === 'object') {
    // Array case
    if (Array.isArray(value)) {
      // index-based brackets: ['aa', 'bb'] + 'foo' -> "foo[0]=aa&foo[1]=bb"
      return value.flatMap((v, i) => {
        const newKey = `${key}[${i}]`;
        return buildParams(newKey, v);
      });
    }

    // Plain object case
    return Object.keys(value).flatMap((k) => {
      const newKey = `${key}[${k}]`;
      return buildParams(newKey, value[k]);
    });
  }

  return [`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`];
}

// nested object to a bracket query string (no leading "?"),
// e.g. { x: 'xx', y: [1, 2], z: { f: 'x' } } -> "x=xx&y[0]=1&y[1]=2&z[f]=x"
export function serializeQuery(obj: Record<string, KnownAny>): string {
  if (!obj || typeof obj !== 'object') return '';

  // Collect query segments
  const segments: string[] = [];
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];
      segments.push(...buildParams(key, value));
    }
  }

  return segments.join('&');
}
