import type { KnownAny } from '../types/utils.js';

// segments that would let a query string reach Object.prototype, such pairs are dropped like qs does
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// bracket key to path segments: "z[d][0][x]" => ["z", "d", "0", "x"], "arr[]" => ["arr", ""] ("" means push)
function parseKey(key: string): string[] {
  // The first segment is everything up to the first '[' (or the entire key if no '[')
  const segments: string[] = [];
  const topKeyMatch = key.match(/^([^[\]]+)/);
  if (topKeyMatch) {
    segments.push(topKeyMatch[1]);
  } else {
    // If it starts with brackets, treat it as empty? (edge case)
    segments.push('');
  }

  // Now capture all bracket parts: [something], [0], []
  const bracketRegex = /\[([^[\]]*)\]/g;
  let match: RegExpExecArray | null;
  while (true) {
    match = bracketRegex.exec(key);
    if (match === null) break;
    // match[1] is the content inside the brackets
    segments.push(match[1]);
  }

  return segments;
}

// past this an index becomes an object key, like qs does, so a short query cannot size a huge array
const ARRAY_LIMIT = 100;

// digits only, Number() would take "-1" and "1e2" and then drop the value on an array
function isArrayIndex(segment: string): boolean {
  return /^\d+$/.test(segment) && Number(segment) <= ARRAY_LIMIT;
}

// which container the next segment needs, "" is a push and so wants an array too
function wantsArray(segment: unknown): boolean {
  return typeof segment === 'string' && (segment === '' || isArrayIndex(segment));
}

// sets a value at a segment path: numeric => array index, "" => array push, else object property
function setValue(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current: KnownAny = obj;
  let parent: KnownAny = null;
  let parentKey: string | number = '';

  // an array only keeps numeric indices, any other key is dropped on serialization,
  // so replace the array with an object before setting one
  const demoteArray = () => {
    if (!Array.isArray(current)) return;
    const replacement: Record<string, unknown> = {};
    const source = current as unknown as Record<string, unknown>;
    for (const key of Object.keys(source)) replacement[key] = source[key];
    if (parent) parent[parentKey] = replacement;
    current = replacement;
  };

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];

    // If we're at the last segment, set the value
    if (i === path.length - 1) {
      if (segment === '') {
        // Empty bracket => push
        if (!Array.isArray(current)) {
          current = [];
        }
        current.push(value);
      } else if (isArrayIndex(segment)) {
        // Numeric segment => array index
        const idx = Number(segment);
        if (!Array.isArray(current)) {
          current = [];
        }
        current[idx] = value;
      } else {
        // Object property
        demoteArray();
        current[segment] = value;
      }
    } else {
      // Not the last segment: descend into existing structure or create it
      const nextSegment = path[i + 1];

      if (segment === '') {
        // Empty bracket => push
        if (!Array.isArray(current)) {
          // Convert the current node into an array, if not one
          current = [];
        }
        // If we are not at the last path, we need a placeholder object or array
        // for the next segment. We'll push something and move current to that.
        if (current.length === 0) {
          // nothing in array yet
          current.push(wantsArray(nextSegment) ? [] : {});
        } else if (wantsArray(nextSegment)) {
          // next is numeric => we want an array
          if (!Array.isArray(current[current.length - 1])) {
            current[current.length - 1] = [];
          }
        } else {
          // next is not numeric => we want an object
          if (typeof current[current.length - 1] !== 'object') {
            current[current.length - 1] = {};
          }
        }
        parent = current;
        parentKey = current.length - 1;
        current = current[current.length - 1];
      } else if (isArrayIndex(segment)) {
        // segment is numeric => array index
        const idx = Number(segment);
        if (!Array.isArray(current)) {
          current = [];
        }
        if (current[idx] === undefined) {
          // Create placeholder for next segment
          current[idx] = wantsArray(nextSegment) ? [] : {};
        }
        parent = current;
        parentKey = idx;
        current = current[idx];
      } else {
        // segment is an object key
        demoteArray();
        if (current[segment] === undefined) {
          // Create placeholder
          current[segment] = wantsArray(nextSegment) ? [] : {};
        }
        parent = current;
        parentKey = segment;
        current = current[segment];
      }
    }
  }
}

// bracket query string to a nested object, supports "a[b][0]=value", "arr[]=1&arr[]=2" etc,
// e.g. "x=xx&y[0]=yy&z[f]=x&z[d][x]=ee" => { x: "xx", y: ["yy"], z: { f: "x", d: { x: "ee" } } }
export function parseQuery(queryString: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (!queryString) return result;

  // Split into key=value pairs
  const pairs = queryString
    .replace(/^\?/, '') // Remove leading "?" if present
    .split('&');

  for (const pair of pairs) {
    // split at the first "=" only, unencoded "=" is legal inside values (base64, JWTs, signatures)
    const eqIndex = pair.indexOf('=');
    const rawKey = eqIndex === -1 ? pair : pair.slice(0, eqIndex);
    const rawVal = eqIndex === -1 ? '' : pair.slice(eqIndex + 1);

    const decodedKey = decodeURIComponent(rawKey);
    const decodedVal = decodeURIComponent(rawVal);

    // Parse bracket notation
    const pathSegments = parseKey(decodedKey);

    if (pathSegments.some((segment) => FORBIDDEN_KEYS.has(segment))) continue;

    // Insert into the result object
    setValue(result, pathSegments, decodedVal);
  }

  return result;
}
