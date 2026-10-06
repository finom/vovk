import type { KnownAny } from '../types/utils.js';

// a lone surrogate, as in a string cut inside an emoji, can't be percent-encoded: like a URL does, it becomes U+FFFD
export const encodeURIComponentWellFormed = (value: string) =>
  encodeURIComponent(value.replace(/[\uD800-\uDFFF]/gu, '\uFFFD'));

// recursively builds "key=value" strings, key grows like 'user', 'user[0]', 'user[0][name]'
function buildParams(key: string, value: KnownAny, isToJSONResult = false): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  // as JSON.stringify does, a value with toJSON is sent as its result, once: a Date as an ISO string or nothing
  // when invalid, a URL as its href, a dayjs or Temporal value as its string
  if (!isToJSONResult && typeof value.toJSON === 'function') {
    return buildParams(key, value.toJSON(), true);
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      // index-based brackets: ['aa', 'bb'] + 'foo' -> "foo[0]=aa&foo[1]=bb"; an item that sends nothing, such as
      // null or {}, takes no index, since the server reads indexes with a gap as an object
      let index = 0;
      return value.flatMap((v) => {
        const params = buildParams(`${key}[${index}]`, v);
        if (params.length) index++;
        return params;
      });
    }

    return Object.keys(value).flatMap((k) => {
      const newKey = `${key}[${k}]`;
      return buildParams(newKey, value[k]);
    });
  }

  return [`${encodeURIComponentWellFormed(key)}=${encodeURIComponentWellFormed(String(value))}`];
}

// nested object to a bracket query string (no leading "?"),
// e.g. { x: 'xx', y: [1, 2], z: { f: 'x' } } -> "x=xx&y[0]=1&y[1]=2&z[f]=x"
export function serializeQuery(obj: Record<string, KnownAny>): string {
  if (!obj || typeof obj !== 'object') return '';

  const segments: string[] = [];
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const value = obj[key];
      segments.push(...buildParams(key, value));
    }
  }

  return segments.join('&');
}
