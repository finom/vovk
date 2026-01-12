import type { VovkHandlerSchema, VovkRequest } from '../types.js';
import type { VovkToolDerived, ToModelOutputFn } from './types.js';
import { ToModelOutput } from './ToModelOutput.js';
import { DefaultModelOutput } from './toModelOutputDefault.js';
import { procedure } from '../validation/procedure.js';
import { CombinedSpec } from '../validation/types.js';

// Standard tool input type
type DerivedToolInput = { body?: unknown; query?: unknown; params?: unknown };

type Handler = ((...args: unknown[]) => unknown) & {
  fn?: (input: unknown) => [unknown, Pick<VovkRequest, 'vovk'> | null];
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
  definition?: Parameters<typeof procedure>[0];
};

type CallerInput<TOutput, TFormattedOutput> = {
  handler: Handler;
  body: unknown;
  query: unknown;
  params: unknown;
  schema: VovkHandlerSchema;
  inputSchemas:
    | {
        body?: CombinedSpec;
        query?: CombinedSpec;
        params?: CombinedSpec;
      }
    | undefined;
  meta: Record<string, unknown> | undefined;
  handlerName: string;
  moduleName: string;
  toModelOutput: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
};

async function caller<TOutput, TFormattedOutput>(
  { handler, handlerName, body, query, params, meta, toModelOutput }: CallerInput<TOutput, TFormattedOutput>,
  tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>
): Promise<[TFormattedOutput, Pick<VovkRequest, 'vovk'> | null]> {
  if (!handler.isRPC && !handler.fn) {
    throw new Error('Handler is not a valid RPC or controller method');
  }
  try {
    let result;
    let req = null;
    if (handler.isRPC) {
      result = await handler({
        handler,
        body,
        query,
        params,
        meta,
      });
    } else if (handler.fn) {
      [result, req] = await handler.fn({
        body,
        query,
        params,
        meta,
        transform: (result: unknown, req: unknown) => [result, req],
      });
    } else {
      throw new Error(
        `Unable to call handler "${handlerName}". It's neither RPC nor controller method with "fn" interface.`
      );
    }

    return [
      await toModelOutput(result as TOutput, tool as VovkToolDerived<unknown, TOutput, TFormattedOutput>, req),
      req,
    ];
  } catch (e) {
    return [await toModelOutput(e as Error, tool as VovkToolDerived<unknown, TOutput, TFormattedOutput>, null), null];
  }
}

const makeTool = <TOutput, TFormattedOutput>({
  moduleName,
  handlerName,
  module,
  meta,
  toModelOutput,
  onExecute,
  onError,
}: {
  moduleName: string;
  handlerName: string;
  module: Record<string, Handler>;
  meta: Record<string, unknown> | undefined;
  toModelOutput: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
  onExecute: (
    result: unknown,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError: (
    error: Error,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
}): VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput> => {
  if (!module) {
    throw new Error(`Module "${moduleName}" not found.`);
  }

  const handler = module[handlerName];
  if (!handler) {
    throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
  }
  const { schema, definition } = handler;
  const inputSchemas = Object.fromEntries(
    (['body', 'query', 'params'] as const).map((key) => [key, definition?.[key]]).filter(([, value]) => Boolean(value))
  );

  if (!schema || !schema.operationObject) {
    throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
  }

  const execute = async (input: { body?: unknown; query?: unknown; params?: unknown }): Promise<TFormattedOutput> => {
    const { body, query, params } = input;

    const callerInput: CallerInput<TOutput, TFormattedOutput> = {
      schema,
      inputSchemas,
      handler,
      body,
      query,
      params,
      meta,
      handlerName,
      moduleName,
      toModelOutput,
    };

    const [result, req] = await caller(callerInput, tool);
    if (result instanceof Error) {
      onError(result, tool, req);
    } else {
      onExecute(result, tool, req);
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
  const tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput> = {
    type: 'function',
    execute,
    name: schema.operationObject?.['x-tool']?.name ?? `${moduleName}_${handlerName}`,
    inputSchema: undefined,
    outputSchema: definition?.output,
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
  };

  return tool;
};

// Base options type without toModelOutput
type DeriveToolsBaseOptions<TOutput = unknown, TFormattedOutput = unknown> = {
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  onExecute?: (
    result: unknown,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError?: (
    error: Error,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
};

// Return type helper
type DeriveToolsResult<TOutput, TFormattedOutput> = {
  tools: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>[];
  toolsByName: Record<string, VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>>;
};

/**
 * Derives AI tools from controllers and RPC modules.
 * @see https://vovk.dev/tools
 * @example
 * ```ts
 * import { deriveTools, ToModelOutput } from 'vovk';
 * import { UserRPC } from 'vovk-client';
 *
 * // Derive AI tools from the UserRPC module
 * const { tools, toolsByName } = deriveTools({
 *   modules: { UserRPC },
 *   toModelOutput: ToModelOutput.MCP,
 *   onExecute: (result, tool) => {
 *     console.log(`Tool ${tool.name} executed successfully.`);
 *   },
 *   onError: (error, tool) => {
 *     console.error(`Tool ${tool.name} execution failed:`, error);
 *   },
 * });
 * ```
 */
// Overload: without toModelOutput - returns DefaultModelOutput
export function deriveTools<TOutput = unknown, TFormattedOutput = DefaultModelOutput<TOutput>>(
  options: DeriveToolsBaseOptions & {
    toModelOutput?: never;
  }
): DeriveToolsResult<TOutput, TFormattedOutput>;

// Overload: with toModelOutput - infers TFormattedOutput from the function
export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(
  options: DeriveToolsBaseOptions & {
    toModelOutput: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
  }
): DeriveToolsResult<TOutput, TFormattedOutput>;

export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(options: {
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  toModelOutput?: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
  onExecute?: (
    result: unknown,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError?: (
    error: Error,
    tool: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
}): DeriveToolsResult<TOutput, TFormattedOutput> {
  const {
    modules,
    meta,
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<unknown, TOutput, TFormattedOutput>,
    onExecute = (result) => result,
    onError = () => {},
  } = options;

  const tools = Object.entries(
    (modules as Record<string, Record<string, Handler & { schema?: VovkHandlerSchema }>>) ?? {}
  )
    .map(([moduleName, module]) => {
      return Object.entries(module ?? {})
        .filter(
          ([, handler]) => handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool']?.hidden
        )
        .map(([handlerName]) =>
          makeTool<TOutput, TFormattedOutput>({
            moduleName,
            handlerName,
            module,
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
