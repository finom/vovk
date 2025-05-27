import { KnownAny, VovkHandlerSchema } from '../types';

const createLLMFunction = (rpcModuleName: string, handlerName: string, schema: VovkHandlerSchema) => {
  return {
    name: `${rpcModuleName}.${handlerName}`,
    description:
      [schema.openapi?.summary ?? '', schema.openapi?.description ?? ''].filter(Boolean).join('\n') || handlerName,
    parameters: {
      type: 'object',
      properties: {
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
      },
      required: [
        ...(schema?.validation?.body ? ['body'] : []),
        ...(schema?.validation?.query ? ['query'] : []),
        ...(schema?.validation?.params ? ['params'] : []),
      ],
      additionalProperties: false,
    },
  };
};

const defaultCallRPCMethod = async ({
  handler,
  body,
  query,
  params,
}: {
  schema?: KnownAny;
  handler: (options: {
    body?: KnownAny;
    query?: KnownAny;
    params?: KnownAny;
    [key: string]: KnownAny;
  }) => Promise<KnownAny>;
  body?: KnownAny;
  query?: KnownAny;
  params?: KnownAny;
}) => {
  return handler({
    body,
    query,
    params,
  });
};

const defaultCallControllerMethod = async ({
  handler,
  body,
  query,
  params,
}: {
  schema?: KnownAny;
  handler: ((...args: KnownAny[]) => KnownAny) & {
    func: (req: KnownAny) => KnownAny;
  };
  body?: KnownAny;
  query?: KnownAny;
  params?: KnownAny;
}) => {
  return handler.func({
    body,
    query,
    params,
  });
};

export function createLLMFunctions({
  modules,
  callRPCMethod = defaultCallRPCMethod,
  callControllerMethod = defaultCallControllerMethod,
}: {
  modules: Record<string, Record<string, (...args: KnownAny[]) => KnownAny>>;
  callRPCMethod?: typeof defaultCallRPCMethod;
  callControllerMethod?: typeof defaultCallControllerMethod;
}) {
  const functions = Object.entries(modules)
    .map(([moduleName, module]) => {
      return Object.entries(module)
        .filter(([, handler]) => (handler as unknown as { schema: VovkHandlerSchema }).schema)
        .map(([handlerName, handler]) => {
          createLLMFunction(moduleName, handlerName, (handler as unknown as { schema: VovkHandlerSchema }).schema);
        });
    })
    .flat();
  const run = (
    functionName: string,
    input: [
      {
        body?: KnownAny;
        query?: KnownAny;
        params?: KnownAny;
      },
    ]
  ) => {
    const [moduleName, handlerName] = functionName.split('.');

    const { body, query, params } = input[0];
    const module = modules[moduleName];
    if (!module) {
      throw new Error(`Module "${moduleName}" not found.`);
    }
    const handler = module[handlerName] as ((...args: KnownAny[]) => KnownAny) & {
      schema: VovkHandlerSchema;
      func: (req: KnownAny) => KnownAny;
      isRPC?: boolean;
    };
    if (!handler) {
      throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
    }

    const { schema, isRPC } = handler;
    if (!schema) {
      throw new Error(`Schema for handler "${handlerName}" in module "${moduleName}" not found.`);
    }

    if (isRPC) {
      return callRPCMethod({
        schema,
        handler,
        body,
        query,
        params,
      });
    }
    return callControllerMethod({
      schema,
      handler,
      body,
      query,
      params,
    });
  };
  return {
    functions,
    run,
  };
}
