import type { KnownAny, VovkHandlerSchema, VovkLLMFunction } from '../types';

type Handler = ((...args: KnownAny[]) => KnownAny) & {
  func?: (input: KnownAny) => KnownAny;
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
};

const createLLMFunction = ({
  rpcModuleName,
  handlerName,
  caller,
  modules,
  onSuccess,
  onError,
}: {
  rpcModuleName: string;
  handlerName: string;
  caller: typeof defaultCaller;
  modules: Record<string, Record<string, Handler>>;
  onSuccess: (result: KnownAny) => void;
  onError: (error: Error) => void;
}): VovkLLMFunction => {
  const module = modules[rpcModuleName];
  if (!module) {
    throw new Error(`Module "${rpcModuleName}" not found.`);
  }

  const handler = module[handlerName];
  if (!handler) {
    throw new Error(`Handler "${handlerName}" not found in module "${rpcModuleName}".`);
  }
  const { schema } = handler;

  if (!schema || !schema.openapi) {
    throw new Error(`Handler "${handlerName}" in module "${rpcModuleName}" does not have a valid schema.`);
  }

  const execute = (
    input: {
      body?: KnownAny;
      query?: KnownAny;
      params?: KnownAny;
    },
    options: KnownAny
  ) => {
    const { body, query, params } = input;

    return caller(
      {
        schema,
        handler,
        body,
        query,
        params,
      },
      options
    )
      .then((data) => onSuccess(data) ?? data)
      .catch((error) => onError?.(error) ?? error);
  };
  const parametersProperties = {
    ...(schema?.validation?.body
      ? {
          body: schema.validation.body,
        }
      : {}),
    ...(schema?.validation?.query
      ? {
          query: schema.validation.query,
        }
      : {}),
    ...(schema?.validation?.params
      ? {
          params: schema.validation.params,
        }
      : {}),
  };
  return {
    execute,
    name: `${rpcModuleName}__${handlerName}`,
    description:
      [schema.openapi?.summary ?? '', schema.openapi?.description ?? ''].filter(Boolean).join('\n') || handlerName,
    ...(Object.keys(parametersProperties).length
      ? {
          parameters: {
            type: 'object',
            properties: parametersProperties,
            required: Object.keys(parametersProperties),
            additionalProperties: false,
          },
        }
      : {}),
  };
};

async function defaultCaller(
  {
    handler,
    body,
    query,
    params,
  }: {
    handler: ((...args: KnownAny[]) => KnownAny) & {
      func?: (req: KnownAny) => KnownAny;
      isRPC?: boolean;
    };
    body: KnownAny;
    query: KnownAny;
    params: KnownAny;
    schema: VovkHandlerSchema;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: KnownAny
) {
  if (handler.isRPC) {
    return handler({
      handler,
      body,
      query,
      params,
    });
  }
  if (handler.func) {
    return handler.func({
      body,
      query,
      params,
    });
  }

  throw new Error('Handler is not a valid RPC or controller method');
}
export function createLLMFunctions({
  modules,
  caller = defaultCaller,
  onSuccess = (result) => result,
  onError = () => {},
}: {
  modules: Record<string, Record<string, (...args: KnownAny[]) => KnownAny>>;
  caller?: typeof defaultCaller;
  onSuccess?: (result: KnownAny) => void;
  onError?: (error: Error) => void;
}): { functions: VovkLLMFunction[] } {
  const functions = Object.entries(modules)
    .map(([rpcModuleName, module]) => {
      return Object.entries(module)
        .filter(([, handler]) => (handler as unknown as { schema: VovkHandlerSchema }).schema?.openapi)
        .map(([handlerName]) =>
          createLLMFunction({
            rpcModuleName,
            handlerName,
            caller,
            modules,
            onSuccess,
            onError,
          })
        );
    })
    .flat();
  return {
    functions,
  };
}
