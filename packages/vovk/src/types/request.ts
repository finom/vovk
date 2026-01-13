import type { KnownAny } from './utils.js';

/**
 * Represents a cookie object
 */
export type VovkRequestCookie = {
  name: string;
  value: string;
  [key: string]: string;
};

/**
 * The Vovk.ts request object, extending Next.js's NextRequest
 * Accepts three generic parameters:
 * - TBody: the expected shape of the request body (default: unknown)
 * - TQuery: the expected shape of the query parameters (default: unknown)
 * - TParams: the expected shape of the route parameters (default: unknown)
 * @see https://vovk.dev/procedure
 */
export interface VovkRequest<TBody = unknown, TQuery = unknown, TParams = unknown> extends Request {
  json: () => Promise<TBody>;
  cookies: {
    set: (name: string, value: string) => void;
    get: (name: string) => VovkRequestCookie | undefined;
    getAll: (name?: string) => VovkRequestCookie[];
    delete: (name: string) => boolean;
    has: (name: string) => boolean;
    clear: () => void;
  };
  nextUrl: {
    basePath: string;
    buildId: string | undefined;
    pathname: string;
    search: string;
    searchParams: {
      get: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends readonly (infer ITEM)[] ? ITEM : TQuery[KEY];
      getAll: <KEY extends keyof TQuery>(key: KEY) => TQuery[KEY] extends unknown[] ? TQuery[KEY] : TQuery[KEY][];
      entries: () => IterableIterator<[keyof TQuery, TQuery[keyof TQuery]]>;
      forEach: (callbackfn: (value: TQuery[keyof TQuery], key: keyof TQuery) => void) => void;
      keys: () => IterableIterator<keyof TQuery>;
      values: () => IterableIterator<TQuery[keyof TQuery]>;
    };
  };
  vovk: {
    body: () => Promise<TBody>;
    query: () => TQuery;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    form: <T = TBody>() => Promise<T>;
    params: () => TParams;
  };
}
