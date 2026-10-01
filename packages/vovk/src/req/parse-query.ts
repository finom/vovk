import { HttpException } from '../core/http-exception.js';
import { HttpStatus } from '../types/enums.js';

// form encoding, as URLSearchParams and GET forms send it, where "+" is a space
function decodeQueryComponent(component: string): string {
  try {
    return decodeURIComponent(component.replace(/\+/g, ' '));
  } catch {
    throw new HttpException(HttpStatus.BAD_REQUEST, `Malformed query string: ${component}`);
  }
}

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

type QueryNode = string | QueryContainer;

// built as Maps, so no key can reach a prototype; containers become arrays or objects at the end
type QueryContainer = Map<string, QueryNode>;

// sets a value at a segment path, "" is a push: the key after the ones the container already holds
function setValue(root: QueryContainer, path: string[], value: string): void {
  let container = root;
  path.forEach((segment, i) => {
    const key = segment === '' ? String(container.size) : segment;
    if (i === path.length - 1) {
      container.set(key, value);
      return;
    }
    // a scalar under the key can't take a nested key, so a container replaces it
    const existing = container.get(key);
    const next = existing instanceof Map ? existing : new Map<string, QueryNode>();
    container.set(key, next);
    container = next;
  });
}

// a container whose keys are exactly 0..n-1 is an array, any other is an object: an index can't size an
// array beyond the pairs that fill it, and a record with numeric keys such as { 7: 'on' } stays a record
function toValue(node: QueryNode): unknown {
  if (typeof node === 'string') return node;
  const entries = [...node].map(([key, child]) => [key, toValue(child)] as const);
  const isArray = entries.every(([key]) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < entries.length);
  if (isArray) {
    const array: unknown[] = new Array(entries.length);
    for (const [key, value] of entries) array[Number(key)] = value;
    return array;
  }
  return Object.fromEntries(entries);
}

// bracket query string to a nested object, supports "a[b][0]=value", "arr[]=1&arr[]=2" etc,
// e.g. "x=xx&y[0]=yy&z[f]=x&z[d][x]=ee" => { x: "xx", y: ["yy"], z: { f: "x", d: { x: "ee" } } }
export function parseQuery(queryString: string): Record<string, unknown> {
  const root: QueryContainer = new Map();

  if (!queryString) return {};

  // Split into key=value pairs
  const pairs = queryString
    .replace(/^\?/, '') // Remove leading "?" if present
    .split('&');

  for (const pair of pairs) {
    // split at the first "=" only, unencoded "=" is legal inside values (base64, JWTs, signatures)
    const eqIndex = pair.indexOf('=');
    const rawKey = eqIndex === -1 ? pair : pair.slice(0, eqIndex);
    const rawVal = eqIndex === -1 ? '' : pair.slice(eqIndex + 1);

    const decodedKey = decodeQueryComponent(rawKey);
    const decodedVal = decodeQueryComponent(rawVal);

    // Parse bracket notation
    const pathSegments = parseKey(decodedKey);

    // a key that starts with a bracket has no name to set
    if (pathSegments[0] === '' || pathSegments.some((segment) => FORBIDDEN_KEYS.has(segment))) continue;

    setValue(root, pathSegments, decodedVal);
  }

  // the query itself is always an object, even with keys such as "0"
  return Object.fromEntries([...root].map(([key, node]) => [key, toValue(node)]));
}
