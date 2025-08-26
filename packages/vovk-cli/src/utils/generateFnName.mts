import { HttpMethod } from 'vovk';

export interface VerbMapEntry {
  noParams?: string;
  withParams?: string;
  default?: string;
}

export const VERB_MAP: Record<HttpMethod, VerbMapEntry> = {
  GET: { noParams: 'list', withParams: 'get' },
  POST: { default: 'create' },
  PUT: { default: 'update' },
  PATCH: { default: 'patch' },
  DELETE: { default: 'delete' },
  HEAD: { default: 'head' },
  OPTIONS: { default: 'options' },
};

export function capitalize(str: string): string {
  if (str.length === 0) return '';
  return str[0].toUpperCase() + str.slice(1);
}

interface GenerateFnNameOptions {
  /** Segments to strip out (e.g. ['api','v1']) */
  ignoreSegments?: string[];
}

const DEFAULT_OPTIONS: GenerateFnNameOptions = {
  ignoreSegments: ['api'],
};

/**
 * Turn an HTTP method + OpenAPI path into a camelCased function name.
 *
 * Examples:
 *   generateFnName('GET', '/users')                     // "listUsers"
 *   generateFnName('GET', '/users/{id}')                // "getUsersById"
 *   generateFnName('POST', '/v1/api/orders')            // "createOrders"
 *   generateFnName('PATCH', '/users/{userId}/profile')  // "patchUsersProfileByUserId"
 */
export function generateFnName(method: HttpMethod, rawPath: string, opts: GenerateFnNameOptions = {}): string {
  const { ignoreSegments } = {
    ...DEFAULT_OPTIONS,
    ...opts,
  };

  // 1. Clean & split path
  const parts = rawPath
    .replace(/^\/|\/$/g, '') // strip leading/trailing slash
    .split('/')
    .filter((seg) => !ignoreSegments?.includes(seg.toLowerCase()))
    .filter(Boolean);

  // 2. Separate resource tokens from path-params
  const resources: string[] = [];
  const params: string[] = [];

  parts.forEach((seg) => {
    const match = seg.match(/^{?([^}]+)}?$/);
    if (match) {
      params.push(match[1]);
    } else {
      resources.push(seg);
    }
  });

  // 3. Pick base verb from VERB_MAP
  let baseVerb: string;
  if (method === 'GET') {
    baseVerb = params.length ? VERB_MAP.GET.withParams! : VERB_MAP.GET.noParams!;
  } else {
    baseVerb = VERB_MAP[method].default!;
  }

  // 4. Build the “resource” part
  const resourcePart = resources.map(capitalize).join('');

  // 5. Build the “ByParam” suffix
  const byParams = params.length ? 'By' + params.map(capitalize).join('') : '';

  // 6. Combine and ensure camelCase
  const rawName = `${baseVerb}${resourcePart}${byParams}`;
  return rawName[0].toLowerCase() + rawName.slice(1);
}

/*
// --- Example usage ---
console.log(generateFnName('GET', '/users')); // listUsers
console.log(generateFnName('GET', '/users/{id}')); // getUsersById
console.log(generateFnName('POST', '/users')); // createUsers
console.log(generateFnName('PATCH', '/users/{userId}/profile')); // patchUsersProfileByUserId
console.log(generateFnName('DELETE', '/v1/api/orders/{orderId}')); // deleteOrdersByOrderId

// You can also enable singularization:
console.log(generateFnName('GET', '/users/{userId}/orders', { singularizeResources: true })); // getUserOrderByUserId
*/
