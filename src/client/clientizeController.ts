/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { _SmoothieController as SmoothieController, _KnownAny as KnownAny } from '../types';
import {
  _ControllerStaticMethod as ControllerStaticMethod,
  _SmoothieParams as SmoothieParams,
  _SmoothieQuery as SmoothieQuery,
  _SmoothieClientHandler as SmoothieClientHandler,
  _SmoothieClientOptions as SmoothieClientOptions,
  _SmoothieClient as SmoothieClient,
} from './types';

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
    searchParams.set(key, value as string);
    hasQuery = true;
  }
  return `${result}${hasQuery ? '?' : ''}${searchParams.toString()}`;
};

export const _clientizeController = <T, OPTS extends Record<string, KnownAny> = {}>(
  givenController: {
    controllerName: string;
    _prefix?: string;
    _handlers: Record<string, { path: string; httpMethod: string }>;
  },
  handler: SmoothieClientHandler<OPTS, T>,
  options?: SmoothieClientOptions
): SmoothieClient<T, OPTS> => {
  const controller = givenController as T & Pick<SmoothieController, 'controllerName' | '_handlers' | '_prefix'>;
  const client = {} as SmoothieClient<T, OPTS>;
  const metadata = controller._handlers;
  if (!metadata) throw new Error(`No metadata for controller ${String(controller?.controllerName)}`);
  const prefix = trimPath(controller._prefix ?? '');

  for (const [staticMethodName, { path, httpMethod, clientValidators }] of Object.entries(metadata)) {
    const getPath = (params: { [key: string]: string }, query: { [key: string]: string }) =>
      getHandlerPath([prefix, path].join('/'), params, query);

    const validate = ({ body, query }: { body?: unknown; query?: unknown }) => {
      if (options?.disableClientValidation) return;
      return options?.validateOnClient?.({ body, query }, clientValidators ?? {});
    };

    // @ts-expect-error TODO fix later
    client[staticMethodName] = (
      input: {
        body?: unknown;
        query?: { [key: string]: string };
        params?: { [key: string]: string };
      } & OPTS = {} as OPTS
    ) => {
      return handler(
        { name: staticMethodName as keyof T, httpMethod, getPath, validate },
        {
          ...input,
          body: input.body ?? null,
          query: input.query ?? {},
          params: input.params ?? {},
        }
      ) as unknown;
    };
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
