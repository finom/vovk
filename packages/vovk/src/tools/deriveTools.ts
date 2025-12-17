import { StandardSchemaV1 } from '@standard-schema/spec';
import type { KnownAny, VovkHandlerSchema } from '../types';
import type { VovkTool, VovkToolOptions } from './types';
import { ToModelOutput } from './ToModelOutput';
import type { ToModelOutputFn } from './types';
import { DefaultModelOutput } from './toModelOutputDefault';

// Standard tool input type
type DerivedToolInput = { body?: KnownAny; query?: KnownAny; params?: KnownAny };

type Handler = ((...args: KnownAny[]) => KnownAny) & {
  fn?: (input: KnownAny) => KnownAny;
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
  models?: {
    body?: StandardSchemaV1;
    query?: StandardSchemaV1;
    params?: StandardSchemaV1;
    output?: StandardSchemaV1;
    iteration?: StandardSchemaV1;
  };
};

type CallerInput<TOutput, TFormattedOutput> = {
  handler: Handler;
  body: KnownAny;
  query: KnownAny;
  params: KnownAny;
  schema: VovkHandlerSchema;
  toolOptions: VovkToolOptions;
  inputSchemas:
    | {
        body?: StandardSchemaV1;
        query?: StandardSchemaV1;
        params?: StandardSchemaV1;
      }
    | undefined;
  init: RequestInit | undefined;
  apiRoot: string | undefined;
  meta: Record<string, KnownAny> | undefined;
  handlerName: string;
  moduleName: string;
  toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
};

async function caller<TOutput, TFormattedOutput>(
  {
    handler,
    handlerName,
    body,
    query,
    params,
    init,
    meta,
    toModelOutput,
    schema,
    toolOptions,
  }: CallerInput<TOutput, TFormattedOutput>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _processingMeta: KnownAny
): Promise<[TFormattedOutput]> {
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

    return [await toModelOutput(result, { toolOptions, handlerSchema: schema, request: null })];
  } catch (e) {
    return [await toModelOutput(e as Error, { toolOptions, handlerSchema: schema, request: null })];
  }
}

const makeTool = <TOutput, TFormattedOutput>({
  moduleName,
  handlerName,
  module,
  init,
  apiRoot,
  meta,
  toModelOutput,
  onExecute,
  onError,
}: {
  moduleName: string;
  handlerName: string;
  module: Record<string, Handler>;
  init: RequestInit | undefined;
  apiRoot: string | undefined;
  meta: Record<string, KnownAny> | undefined;
  toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
  onExecute: (result: KnownAny, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
  onError: (error: Error, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
}): VovkTool<DerivedToolInput, TOutput, TFormattedOutput, true> => {
  if (!module) {
    throw new Error(`Module "${moduleName}" not found.`);
  }

  const handler = module[handlerName];
  if (!handler) {
    throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
  }
  const { schema, models } = handler;
  const inputSchemas = Object.fromEntries(
    (['body', 'query', 'params'] as const)
      .map((key) => [key, models?.[key] || undefined])
      .filter(([, value]) => Boolean(value))
  );

  if (!schema || !schema.operationObject) {
    throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
  }

  const execute = async (
    input: {
      body?: KnownAny;
      query?: KnownAny;
      params?: KnownAny;
    },
    processingMeta?: KnownAny
  ): Promise<TFormattedOutput> => {
    const { body, query, params } = input;
    const toolOptions: VovkToolOptions = schema.operationObject?.['x-tool'] ?? {};

    const callerInput: CallerInput<TOutput, TFormattedOutput> = {
      schema,
      inputSchemas,
      handler,
      toolOptions,
      body,
      query,
      params,
      init,
      apiRoot,
      meta,
      handlerName,
      moduleName,
      toModelOutput,
    };

    const [result] = await caller(callerInput, processingMeta);
    if (result instanceof Error) {
      onError(result, { toolOptions, processingMeta });
    } else {
      onExecute(result, { toolOptions, processingMeta });
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
    name: schema.operationObject?.['x-tool']?.name ?? `${moduleName}_${handlerName}`,
    inputSchema: undefined,
    outputSchema: models?.output,
    title: schema.operationObject?.['x-tool']?.title ?? schema.operationObject?.summary,
    description:
      schema.operationObject?.['x-tool']?.description ??
      ([schema.operationObject?.summary ?? '', schema.operationObject?.description ?? ''].filter(Boolean).join('\n') ||
        handlerName),
    parameters: {
      type: 'object',
      properties: parametersProperties,
      required: Object.keys(parametersProperties) as Array<keyof typeof parametersProperties>,
      additionalProperties: false,
    },
    inputSchemas,
  } satisfies VovkTool<DerivedToolInput, unknown, TFormattedOutput, true>;
};

// Base options type without toModelOutput
type DeriveToolsBaseOptions = {
  modules: Record<string, object | [object, { init?: RequestInit; apiRoot?: string }]>;
  meta?: Record<string, KnownAny>;
  onExecute?: (result: KnownAny, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
  onError?: (error: Error, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
};

// Return type helper
type DeriveToolsResult<TOutput, TFormattedOutput> = {
  tools: VovkTool<DerivedToolInput, TOutput, TFormattedOutput, true>[];
  toolsByName: Record<string, VovkTool<DerivedToolInput, TOutput, TFormattedOutput, true>>;
};

// Overload: without toModelOutput - returns DefaultModelOutput
export function deriveTools<TOutput = unknown, TFormattedOutput = DefaultModelOutput<TOutput>>(
  options: DeriveToolsBaseOptions & {
    toModelOutput?: never;
  }
): DeriveToolsResult<TOutput, TFormattedOutput>;

// Overload: with toModelOutput - infers TFormattedOutput from the function
export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(
  options: DeriveToolsBaseOptions & {
    toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
  }
): DeriveToolsResult<TOutput, TFormattedOutput>;

// Implementation
export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(options: {
  modules: Record<string, object | [object, { init?: RequestInit; apiRoot?: string }]>;
  meta?: Record<string, unknown>;
  toModelOutput?: ToModelOutputFn<TOutput, TFormattedOutput>;
  onExecute?: (result: unknown, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
  onError?: (error: Error, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
}): DeriveToolsResult<TOutput, TFormattedOutput> {
  const {
    modules,
    meta,
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<TOutput, TFormattedOutput>,
    onExecute = (result) => result,
    onError = () => {},
  } = options;
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
          ([, handler]) => handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool']?.hidden
        )
        .map(([handlerName]) =>
          makeTool<TOutput, TFormattedOutput>({
            moduleName,
            handlerName,
            module,
            init,
            apiRoot,
            meta,
            toModelOutput,
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
