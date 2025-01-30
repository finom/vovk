import type { KnownAny } from '../types';

/**
 * Parse a bracket-based key (e.g. "z[d][0][x]" or "arr[]")
 * into an array of path segments (strings or special push-markers).
 *
 * Example: "z[d][0][x]" => ["z", "d", "0", "x"]
 * Example: "arr[]"      => ["arr", "" ]  // "" indicates "push" onto array
 */
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
  while ((match = bracketRegex.exec(key)) !== null) {
    // match[1] is the content inside the brackets
    segments.push(match[1]);
  }

  return segments;
}

/**
 * Recursively set a value in a nested object/array, given a path of segments.
 * - If segment is numeric => treat as array index
 * - If segment is empty "" => push to array
 * - Else => object property
 */
function setValue(obj: Record<string, KnownAny>, path: string[], value: KnownAny): void {
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
      } else if (!isNaN(Number(segment))) {
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
          current.push(typeof nextSegment === 'string' && !isNaN(Number(nextSegment)) ? [] : {});
        } else if (typeof nextSegment === 'string' && !isNaN(Number(nextSegment))) {
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
      } else if (!isNaN(Number(segment))) {
        // segment is numeric => array index
        const idx = Number(segment);
        if (!Array.isArray(current)) {
          current = [];
        }
        if (current[idx] === undefined) {
          // Create placeholder for next segment
          current[idx] = typeof nextSegment === 'string' && !isNaN(Number(nextSegment)) ? [] : {};
        }
        current = current[idx];
      } else {
        // segment is an object key
        if (current[segment] === undefined) {
          // Create placeholder
          current[segment] = typeof nextSegment === 'string' && !isNaN(Number(nextSegment)) ? [] : {};
        }
        current = current[segment];
      }
    }
  }
}

/**
 * Deserialize a bracket-based query string into an object.
 *
 * Supports:
 *   - Key/value pairs with nested brackets (e.g. "a[b][0]=value")
 *   - Arrays with empty bracket (e.g. "arr[]=1&arr[]=2")
 *   - Mixed arrays of objects, etc.
 *
 * @example
 *   parseQuery("x=xx&y[0]=yy&y[1]=uu&z[f]=x&z[u][0]=uu&z[u][1]=xx&z[d][x]=ee")
 *   => {
 *        x: "xx",
 *        y: ["yy", "uu"],
 *        z: {
 *          f: "x",
 *          u: ["uu", "xx"],
 *          d: { x: "ee" }
 *        }
 *      }
 *
 * @param queryString - The raw query string (e.g. location.search.slice(1))
 * @returns           - A nested object representing the query params
 */
export default function parseQuery(queryString: string): Record<string, KnownAny> {
  const result: Record<string, KnownAny> = {};

  if (!queryString) return result;

  // Split into key=value pairs
  const pairs = queryString
    .replace(/^\?/, '') // Remove leading "?" if present
    .split('&');

  for (const pair of pairs) {
    const [rawKey, rawVal = ''] = pair.split('=');

    const decodedKey = decodeURIComponent(rawKey || '');
    const decodedVal = decodeURIComponent(rawVal);

    // Parse bracket notation
    const pathSegments = parseKey(decodedKey);

    // Insert into the result object
    setValue(result, pathSegments, decodedVal);
  }

  return result;
}
