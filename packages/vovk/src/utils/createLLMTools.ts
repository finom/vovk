import type { KnownAny, VovkHandlerSchema, VovkLLMTool } from '../types';

type Handler = ((...args: KnownAny[]) => KnownAny) & {
  fn?: (input: KnownAny) => KnownAny;
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
};

type CallerInput = {
  handler: Handler;
  body: KnownAny;
  query: KnownAny;
  params: KnownAny;
  schema: VovkHandlerSchema;
  init?: RequestInit;
  handlerName: string;
  rpcModuleName: string;
};

const createLLMTool = ({
  rpcModuleName,
  handlerName,
  caller,
  module,
  init,
  onExecute,
  onError,
}: {
  rpcModuleName: string;
  handlerName: string;
  caller: typeof defaultCaller;
  module: Record<string, Handler>;
  init: RequestInit | undefined;
  onExecute: (result: KnownAny, callerInput: CallerInput, options: KnownAny) => void;
  onError: (error: Error, callerInput: CallerInput, options: KnownAny) => void;
}): VovkLLMTool => {
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

    const callerInput: CallerInput = {
      schema,
      handler,
      body,
      query,
      params,
      init,
      handlerName,
      rpcModuleName,
    };

    return caller(callerInput, options)
      .then((data) => onExecute(data, callerInput, options) ?? data)
      .catch((error) => onError?.(error, callerInput, options) ?? error);
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
  { handler, body, query, params, init }: CallerInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: KnownAny
) {
  if (handler.isRPC) {
    return handler({
      handler,
      body,
      query,
      params,
      init,
    });
  }
  if (handler.fn) {
    return handler.fn({
      body,
      query,
      params,
    });
  }

  throw new Error('Handler is not a valid RPC or controller method');
}
export function createLLMTools({
  modules,
  caller = defaultCaller,
  onExecute = (result) => result,
  onError = () => {},
}: {
  modules: Record<string, object | [object, { init?: RequestInit }]>;
  caller?: typeof defaultCaller;
  onExecute?: (result: KnownAny, callerInput: CallerInput, options: KnownAny) => void;
  onError?: (error: Error, callerInput: CallerInput, options: KnownAny) => void;
}): { tools: VovkLLMTool[] } {
  const moduleWithConfig = modules as
    | Record<string, Record<string, Handler>>
    | Record<string, [Record<string, Handler>, { init?: RequestInit }]>;
  const tools = Object.entries(moduleWithConfig ?? {})
    .map(([rpcModuleName, moduleWithconfig]) => {
      let init: RequestInit | undefined;
      let module: Record<string, Handler>;
      if (Array.isArray(moduleWithconfig)) {
        [module, { init }] = moduleWithconfig;
      } else {
        module = moduleWithconfig;
      }
      return Object.entries(module ?? {})
        .filter(([, handler]) => (handler as { schema?: VovkHandlerSchema } | undefined)?.schema?.openapi)
        .map(([handlerName]) =>
          createLLMTool({
            rpcModuleName,
            handlerName,
            caller,
            module,
            init,
            onExecute,
            onError,
          })
        );
    })
    .flat();
  return {
    tools,
  };
}
