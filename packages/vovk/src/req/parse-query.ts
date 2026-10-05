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

// brackets in one key; no client nests this deep, and toValue() recurses once per level
const MAX_DEPTH = 32;

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
class QueryContainer extends Map<string, QueryNode> {
  // the index a push takes: one past the highest index set so far
  nextIndex = 0;
}

const isIndex = (key: string) => /^(0|[1-9]\d*)$/.test(key);

function setEntry(container: QueryContainer, key: string, node: QueryNode): void {
  container.set(key, node);
  if (isIndex(key)) container.nextIndex = Math.max(container.nextIndex, Number(key) + 1);
}

// the container under a key; a scalar there can't take a nested key, so a container replaces it and keeps the scalar
// as its first element, as appendValue does
function getContainer(container: QueryContainer, key: string): QueryContainer {
  const existing = container.get(key);
  if (existing instanceof QueryContainer) return existing;
  const next = new QueryContainer();
  if (existing !== undefined) setEntry(next, '0', existing);
  setEntry(container, key, next);
  return next;
}

// a repeated name collects its values, as qs does: a scalar there becomes the first of them
function appendValue(container: QueryContainer, key: string, value: string): void {
  let values = container.get(key);
  if (!(values instanceof QueryContainer)) {
    const first = values as string;
    values = new QueryContainer();
    setEntry(values, '0', first);
    setEntry(container, key, values);
  }
  setEntry(values, String(values.nextIndex), value);
}

// whether a node holds a key path; one with a push never does, as a push always adds an element
function hasPath(node: QueryNode | undefined, path: string[]): boolean {
  let current = node;
  for (const segment of path) {
    if (segment === '' || !(current instanceof QueryContainer) || !current.has(segment)) return false;
    current = current.get(segment);
  }
  return true;
}

// sets a value at a segment path, "" is a push
function setValue(root: QueryContainer, path: string[], value: string): void {
  let container = root;
  for (let i = 0; i < path.length - 1; i++) {
    let key = path[i];
    if (key === '') {
      // a push followed by more keys reuses the last element unless it already holds the rest of the path, as Rack
      // does: "a[][b]=1&a[][c]=2" fills one element, "a[][b]=1&a[][b]=2" two
      const lastKey = String(container.nextIndex - 1);
      const last = container.nextIndex > 0 ? container.get(lastKey) : undefined;
      key = last instanceof QueryContainer && !hasPath(last, path.slice(i + 1)) ? lastKey : String(container.nextIndex);
    }
    container = getContainer(container, key);
  }

  const key = path[path.length - 1];
  if (key === '') {
    setEntry(container, String(container.nextIndex), value);
  } else if (container.has(key) && (container === root || !isIndex(key))) {
    // a repeated index names one element and keeps its last value; the query's own keys are all names
    appendValue(container, key, value);
  } else {
    setEntry(container, key, value);
  }
}

// a container whose keys are exactly 0..n-1 is an array, any other is an object: an index can't size an
// array beyond the pairs that fill it, and a record with numeric keys such as { 7: 'on' } stays a record
function toValue(node: QueryNode): unknown {
  if (typeof node === 'string') return node;
  const entries = [...node].map(([key, child]) => [key, toValue(child)] as const);
  const isArray = entries.every(([key]) => isIndex(key) && Number(key) < entries.length);
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
  const root = new QueryContainer();

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

    if (pathSegments.length > MAX_DEPTH + 1) {
      throw new HttpException(HttpStatus.BAD_REQUEST, `Query string nested deeper than ${MAX_DEPTH} levels`);
    }

    // a key that starts with a bracket has no name to set
    if (pathSegments[0] === '' || pathSegments.some((segment) => FORBIDDEN_KEYS.has(segment))) continue;

    setValue(root, pathSegments, decodedVal);
  }

  // the query itself is always an object, even with keys such as "0"
  return Object.fromEntries([...root].map(([key, node]) => [key, toValue(node)]));
}
