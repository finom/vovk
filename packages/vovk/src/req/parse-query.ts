import type { KnownAny } from '../types/utils.js';

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

// sets a value at a segment path: numeric => array index, "" => array push, else object property
function setValue(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current: KnownAny = obj;

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
      } else if (!Number.isNaN(Number(segment))) {
        // Numeric segment => array index
        const idx = Number(segment);
        if (!Array.isArray(current)) {
          current = [];
        }
        current[idx] = value;
      } else {
        // Object property
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
          current.push(typeof nextSegment === 'string' && !Number.isNaN(Number(nextSegment)) ? [] : {});
        } else if (typeof nextSegment === 'string' && !Number.isNaN(Number(nextSegment))) {
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
        current = current[current.length - 1];
      } else if (!Number.isNaN(Number(segment))) {
        // segment is numeric => array index
        const idx = Number(segment);
        if (!Array.isArray(current)) {
          current = [];
        }
        if (current[idx] === undefined) {
          // Create placeholder for next segment
          current[idx] = typeof nextSegment === 'string' && !Number.isNaN(Number(nextSegment)) ? [] : {};
        }
        current = current[idx];
      } else {
        // segment is an object key
        if (current[segment] === undefined) {
          // Create placeholder
          current[segment] = typeof nextSegment === 'string' && !Number.isNaN(Number(nextSegment)) ? [] : {};
        }
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

    // Insert into the result object
    setValue(result, pathSegments, decodedVal);
  }

  return result;
}
