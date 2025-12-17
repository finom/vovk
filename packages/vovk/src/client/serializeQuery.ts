import type { KnownAny } from '../types';

/**
 * Recursively build query parameters from an object.
 *
 * @param key      - The query key so far (e.g. 'user', 'user[0]', 'user[0][name]')
 * @param value    - The current value to serialize
 * @returns        - An array of `key=value` strings
 */
function buildParams(key: string, value: KnownAny): string[] {
  if (value === null || value === undefined) {
    return []; // skip null/undefined values entirely
  }

  // If value is an object or array, we need to recurse
  if (typeof value === 'object') {
    // Array case
    if (Array.isArray(value)) {
      /**
       * We use index-based bracket notation here:
       *   e.g. for value = ['aa', 'bb'] and key = 'foo'
       *   => "foo[0]=aa&foo[1]=bb"
       *
       * If you prefer "foo[]=aa&foo[]=bb" style, replace:
       *   `${key}[${i}]`
       * with:
       *   `${key}[]`
       */
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

/**
 * Serialize a nested object (including arrays, arrays of objects, etc.)
 * into a bracket-based query string.
 *
 * @example
 *   serializeQuery({ x: 'xx', y: [1, 2], z: { f: 'x' } })
 *   => "x=xx&y[0]=1&y[1]=2&z[f]=x"
 *
 * @param obj - The input object to be serialized
 * @returns   - A bracket-based query string (without leading "?")
 */
export function serializeQuery(obj: Record<string, KnownAny>): string {
  if (!obj || typeof obj !== 'object') return '';

  // Collect query segments
  const segments: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      segments.push(...buildParams(key, value));
    }
  }

  return segments.join('&');
}
