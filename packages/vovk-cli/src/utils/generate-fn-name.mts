import type { HttpMethod } from 'vovk/internal';

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

// letters and digits only, so the name is an identifier in TypeScript, Python and Rust
const toWords = (text: string) => text.split(/[^\p{L}\p{Nd}]+/u).filter(Boolean);

// HTTP method + OpenAPI path to a camelCased fn name, e.g. GET /users -> "listUsers",
// GET /users/{id} -> "getUsersById", PATCH /users/{userId}/profile -> "patchUsersProfileByUserId",
// DELETE /v1/api/orders/{orderId} -> "deleteV1OrdersByOrderId", GET /files/{name}.json -> "getFilesJsonByName"
export function generateFnName(method: HttpMethod, rawPath: string, opts: GenerateFnNameOptions = {}): string {
  const { ignoreSegments } = {
    ...DEFAULT_OPTIONS,
    ...opts,
  };

  const resources: string[] = [];
  const params: string[] = [];

  for (const segment of rawPath.split('/')) {
    if (!segment || ignoreSegments?.includes(segment.toLowerCase())) continue;
    // a segment can mix literal text and params, e.g. "{name}.json"
    const literal = segment.replace(/\{([^}]*)\}/g, (_, param: string) => {
      params.push(...toWords(param));
      return ' ';
    });
    resources.push(...toWords(literal));
  }

  const verbs = VERB_MAP[method] as VerbMapEntry | undefined;
  const verb =
    (params.length ? verbs?.withParams : verbs?.noParams) ?? verbs?.default ?? toWords(method).join('').toLowerCase();
  const byParams = params.length ? `By${params.map(capitalize).join('')}` : '';

  return `${verb}${resources.map(capitalize).join('')}${byParams}`;
}
