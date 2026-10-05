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

// the query as the URL holds it: the schema's input, or its output where the input type is unknown
type RawQuery<TQueryInput, TQuery> = unknown extends TQueryInput ? TQuery : TQueryInput;

// a required string field keeps its type, a required coerced field is a string;
// an optional field, an array or an object may be absent from the URL
type SearchParamValue<T, KEY extends keyof T> =
  {} extends Pick<T, KEY>
    ? RawSearchParamValue<Exclude<T[KEY], undefined>> | null
    : unknown extends T[KEY]
      ? string
      : undefined extends T[KEY]
        ? RawSearchParamValue<Exclude<T[KEY], undefined>> | null
        : T[KEY] extends object
          ? string | null
          : RawSearchParamValue<T[KEY]>;

/**
 * The Vovk.ts request object extending Next.js's NextRequest, generics: TBody, TQuery, TParams.
 * TBodyInput and TQueryInput are what the client sent, before a schema's defaults and transforms.
 * @see https://vovk.dev/procedure
 */
export interface VovkRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
  TBodyInput = TBody,
  TQueryInput = TQuery,
> extends Request {
  json: () => Promise<TBodyInput>;
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
      get: <KEY extends keyof RawQuery<TQueryInput, TQuery>>(
        key: KEY
      ) => SearchParamValue<RawQuery<TQueryInput, TQuery>, KEY>;
      getAll: <KEY extends keyof RawQuery<TQueryInput, TQuery>>(
        key: KEY
      ) => RawSearchParamValue<SearchParamItem<RawQuery<TQueryInput, TQuery>[KEY]>>[];
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
