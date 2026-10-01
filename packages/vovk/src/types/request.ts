import type { KnownAny } from './utils.js';

/**
 * Represents a cookie object
 */
export type VovkRequestCookie = {
  name: string;
  value: string;
  [key: string]: string;
};

type RawSearchParamValue<T> = T extends string ? T : string;

type SearchParamItem<T> = T extends readonly (infer ITEM)[] ? ITEM : T;

// a required string field keeps its type; an optional field, an array or an object may be absent from the URL
type SearchParamValue<T> = undefined extends T
  ? RawSearchParamValue<Exclude<T, undefined>> | null
  : T extends object
    ? string | null
    : RawSearchParamValue<T>;

/**
 * The Vovk.ts request object extending Next.js's NextRequest, generics: TBody, TQuery, TParams.
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
    // the raw URL: values are strings, and an array or an object goes as tags[0]=…, under keys of its own
    searchParams: {
      get: <KEY extends keyof TQuery>(key: KEY) => SearchParamValue<TQuery[KEY]>;
      getAll: <KEY extends keyof TQuery>(key: KEY) => RawSearchParamValue<SearchParamItem<TQuery[KEY]>>[];
      entries: () => IterableIterator<[string, string]>;
      forEach: (callbackfn: (value: string, key: string) => void) => void;
      keys: () => IterableIterator<string>;
      values: () => IterableIterator<string>;
    };
  };
  vovk: {
    body: () => Promise<TBody>;
    query: () => TQuery;
    meta: <T = Record<KnownAny, KnownAny>>(meta?: T | null) => T;
    params: () => TParams;
  };
}
