import {
  _KnownAny as KnownAny,
  _SmoothieControllerMetadata as SmoothieControllerMetadata,
  _SmoothieControllerMetadataJson as SmoothieControllerMetadataJson,
} from '../types';
import {
  _SmoothieClientFetcher as SmoothieClientFetcher,
  _SmoothieClientOptions as SmoothieClientOptions,
  _SmoothieClient as SmoothieClient,
} from './types';
import {
  _ControllerStaticMethod as ControllerStaticMethod,
  _SmoothieParams as SmoothieParams,
  _SmoothieQuery as SmoothieQuery,
} from '../types';

import { _defaultStreamFetcher as defaultStreamFetcher } from './defaultStreamFetcher';

const trimPath = (path: string) => path.trim().replace(/^\/|\/$/g, '');

const getHandlerPath = <T extends ControllerStaticMethod>(
  endpoint: string,
  params?: SmoothieParams<T>,
  query?: SmoothieQuery<T>
) => {
  let result = endpoint;
  for (const [key, value] of Object.entries(params ?? {})) {
    result = result.replace(`:${key}`, value as string);
  }

  const searchParams = new URLSearchParams();
  let hasQuery = false;
  for (const [key, value] of Object.entries(query ?? {})) {
    searchParams.set(key, value);
    hasQuery = true;
  }

  return `${result}${hasQuery ? '?' : ''}${searchParams.toString()}`;
};

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = Record<string, never>>(
  givenController: SmoothieControllerMetadataJson,
  fetcher: SmoothieClientFetcher<OPTS, T>,
  options?: SmoothieClientOptions<OPTS>
): SmoothieClient<T, OPTS> => {
  const controller = givenController as T & SmoothieControllerMetadata;
  const client = {} as SmoothieClient<T, OPTS>;
  const metadata = controller._handlers;
  if (!metadata) throw new Error(`No metadata for controller ${String(controller?.controllerName)}`);
  const prefix = trimPath(controller._prefix ?? '');
  const { streamFetcher = defaultStreamFetcher } = options ?? {};

  for (const [staticMethodName, { path, httpMethod, clientValidators }] of Object.entries(metadata)) {
    const getPath = (params: { [key: string]: string }, query: { [key: string]: string }) =>
      getHandlerPath([prefix, path].filter(Boolean).join('/'), params, query);

    const validate = ({ body, query }: { body?: unknown; query?: unknown }) => {
      if (options?.disableClientValidation) return;
      return options?.validateOnClient?.({ body, query }, clientValidators ?? {});
    };

    const handler = (
      input: {
        body?: unknown;
        query?: { [key: string]: string };
        params?: { [key: string]: string };
        isStream?: boolean;
      } & OPTS = {} as OPTS
    ) => {
      const internalOptions: Parameters<typeof fetcher>[0] = {
        name: staticMethodName as keyof T,
        httpMethod,
        getPath,
        validate,
      };
      const internalInput = {
        ...input,
        body: input.body ?? null,
        query: input.query ?? {},
        params: input.params ?? {},
        ...options?.defaultOptions,
      };

      if (input.isStream) {
        type Handler = (message: unknown) => void;
        const handlers: Handler[] = [];
        const messages: unknown[] = [];
        if (!streamFetcher) throw new Error('Stream fetcher is not provided');

        internalOptions.onStreamMessage = (message: unknown) => {
          messages.push(message);
          handlers.forEach((handler) => handler(message));
        };

        const fetcherPromise = streamFetcher(internalOptions, internalInput) as Promise<unknown>;

        if (!(fetcherPromise instanceof Promise)) throw new Error('Stream fetcher must return a promise');

        const resultPromise: Promise<unknown> & {
          onMessage?: (handler: Handler) => Promise<unknown>;
        } = fetcherPromise.then(() => messages);

        resultPromise.onMessage = (handler: Handler) => {
          handlers.push(handler);
          return fetcherPromise.then(() => messages);
        };

        return resultPromise;
      }

      const fetcherPromise = fetcher(internalOptions, internalInput) as Promise<unknown> & {
        onMessage: (handler: (message: unknown) => void) => void;
      };

      if (!(fetcherPromise instanceof Promise)) throw new Error('Fetcher must return a promise');

      fetcherPromise.onMessage = () => {
        throw new Error('onMessage is not supported for non-streaming requests');
      };

      return fetcherPromise;
    };

    // @ts-expect-error TODO: Fix this
    client[staticMethodName] = handler;

    // client[staticMethodName].onMessage = (handler: (message: unknown) => void) => {};
  }

  return client;
};

/*

import { get, post } from 'next-smoothie';

class X {
  @get('/foo/:yo')
  static foo(req: SmoothieRequest<{ hello: 'world' }, { q: 'foo' }>, params: { yo: string }) {
    return Promise.resolve(`foo: `);
  }

  @post('/foo/:yo')
  static bar(req: SmoothieRequest<{ name: string }>): number {
    return 1;
  }
}

const clientX = clientizeController<typeof X, { zalupa: 'ebalo' }>(
  X,
  ({ name, httpMethod, getPath }, { body, query, params, zalupa }) => {
    return console.info({ name, httpMethod, getPath, body, query, params, zalupa });
  }
);

const x = await clientX.foo<string>({
  body: { hello: 'world' },
  query: { q: 'foo' },
  params: { yo: 'yo' },
  zalupa: 'ebalo',
});

void clientX.bar({ body: { name: 'John Doe' } });

*/
