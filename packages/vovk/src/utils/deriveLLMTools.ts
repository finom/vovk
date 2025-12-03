import type { KnownAny, VovkHandlerSchema, VovkLLMTool } from '../types';

type Handler = ((...args: KnownAny[]) => KnownAny) & {
  fn?: (input: KnownAny) => KnownAny;
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
  models?: {
    body?: KnownAny;
    query?: KnownAny;
    params?: KnownAny;
    output?: KnownAny;
    iteration?: KnownAny;
  };
};

type CallerInput = {
  handler: Handler;
  body: KnownAny;
  query: KnownAny;
  params: KnownAny;
  schema: VovkHandlerSchema;
  models:
    | {
        body?: KnownAny;
        query?: KnownAny;
        params?: KnownAny;
        output?: KnownAny;
        iteration?: KnownAny;
      }
    | undefined;
  init: RequestInit | undefined;
  apiRoot: string | undefined;
  meta: Record<string, KnownAny> | undefined;
  handlerName: string;
  moduleName: string;
  resultFormatter: typeof defaultResultFormatter;
};

const makeLLMTool = ({
  moduleName,
  handlerName,
  caller,
  module,
  init,
  apiRoot,
  meta,
  resultFormatter,
  onExecute,
  onError,
}: {
  moduleName: string;
  handlerName: string;
  caller: typeof defaultCaller;
  module: Record<string, Handler>;
  init: RequestInit | undefined;
  apiRoot: string | undefined;
  meta: Record<string, KnownAny> | undefined;
  resultFormatter: typeof defaultResultFormatter;
  onExecute: (result: KnownAny, callerInput: CallerInput, options: KnownAny) => void;
  onError: (error: Error, callerInput: CallerInput, options: KnownAny) => void;
}): VovkLLMTool => {
  if (!module) {
    throw new Error(`Module "${moduleName}" not found.`);
  }

  const handler = module[handlerName];
  if (!handler) {
    throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
  }
  const { schema, models } = handler;

  if (!schema || !schema.operationObject) {
    throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
  }

  const execute = async (
    input: {
      body?: KnownAny;
      query?: KnownAny;
      params?: KnownAny;
    },
    options?: KnownAny
  ) => {
    const { body, query, params } = input;

    const callerInput: CallerInput = {
      schema,
      models,
      handler,
      body,
      query,
      params,
      init,
      apiRoot,
      meta,
      handlerName,
      moduleName,
      resultFormatter,
    };

    const [result, error] = await caller(callerInput, options);
    if (error) {
      onError(error, callerInput, options);
    } else {
      onExecute(result, callerInput, options);
    }

    return result;
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
    type: 'function',
    execute,
    name: schema.operationObject?.['x-tool-name'] ?? `${moduleName}_${handlerName}`,
    description:
      schema.operationObject?.['x-tool-description'] ??
      ([schema.operationObject?.summary ?? '', schema.operationObject?.description ?? ''].filter(Boolean).join('\n') ||
        handlerName),
    parameters: {
      type: 'object',
      properties: parametersProperties,
      required: Object.keys(parametersProperties) as Array<keyof typeof parametersProperties>,
      additionalProperties: false,
    },
    models,
  };
};

async function defaultCaller(
  { handler, handlerName, body, query, params, init, meta, resultFormatter, schema }: CallerInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: KnownAny
) {
  if (!handler.isRPC && !handler.fn) {
    throw new Error('Handler is not a valid RPC or controller method');
  }
  try {
    let result;
    if (handler.isRPC) {
      result = await handler({
        handler,
        body,
        query,
        params,
        init,
        meta,
      });
    } else if (handler.fn) {
      result = await handler.fn({
        body,
        query,
        params,
        meta,
      });
    } else {
      throw new Error(
        `Unable to call handler "${handlerName}". It's neither RPC nor controller method with "fn" interface.`
      );
    }

    return [resultFormatter(result, schema), null] as [KnownAny, null];
  } catch (e) {
    return [resultFormatter(e, schema), e] as [KnownAny, Error];
  }
}

async function mcpResultFormatter(result: KnownAny, schema: VovkHandlerSchema) {
  const successMessage = schema?.operationObject?.['x-tool-successMessage'] ?? 'Tool executed successfully.';
  const errorMessage =
    schema?.operationObject?.['x-tool-errorMessage'] ?? 'An error occurred while executing the tool.';
  const includeResponse = schema?.operationObject?.['x-tool-includeResponse'] ?? true;

  return {
    content: [
      {
        type: 'text',
        text: [
          result instanceof Error ? errorMessage : successMessage,
          includeResponse
            ? `${result instanceof Error ? 'Error' : 'Result'}:\n${JSON.stringify(result, null, 2)}`
            : null,
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
    ],
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function defaultResultFormatter(result: KnownAny, _schema: VovkHandlerSchema) {
  return result;
}

export function deriveLLMTools({
  modules,
  caller = defaultCaller,
  meta,
  resultFormatter,
  onExecute = (result) => result,
  onError = () => {},
}: {
  modules: Record<string, object | [object, { init?: RequestInit; apiRoot?: string }]>;
  caller?: typeof defaultCaller;
  meta?: Record<string, KnownAny>;
  resultFormatter?: typeof defaultResultFormatter | null | 'mcp';
  onExecute?: (result: KnownAny, callerInput: CallerInput, options: KnownAny) => void;
  onError?: (error: Error, callerInput: CallerInput, options: KnownAny) => void;
}): { tools: VovkLLMTool[]; toolsByName: Record<string, VovkLLMTool> } {
  const moduleWithConfig = modules as
    | Record<string, Record<string, Handler & { schema?: VovkHandlerSchema }>>
    | Record<
        string,
        [Record<string, Handler & { schema?: VovkHandlerSchema }>, { init?: RequestInit; apiRoot?: string }]
      >;
  const tools = Object.entries(moduleWithConfig ?? {})
    .map(([moduleName, moduleWithconfig]) => {
      let init: RequestInit | undefined;
      let apiRoot: string | undefined;
      let module: Record<string, Handler>;
      if (Array.isArray(moduleWithconfig)) {
        [module, { init, apiRoot }] = moduleWithconfig;
      } else {
        module = moduleWithconfig;
      }
      return Object.entries(module ?? {})
        .filter(
          ([, handler]) => handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool-disable']
        )
        .map(([handlerName]) =>
          makeLLMTool({
            moduleName,
            handlerName,
            caller,
            module,
            init,
            apiRoot,
            meta,
            resultFormatter: resultFormatter
              ? resultFormatter === 'mcp'
                ? mcpResultFormatter
                : resultFormatter
              : defaultResultFormatter,
            onExecute,
            onError,
          })
        );
    })
    .flat();
  const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));
  return {
    tools,
    toolsByName,
  };
}
