import { StandardSchemaV1 } from '@standard-schema/spec';
import type { KnownAny, VovkHandlerSchema, VovkRequest } from '../types';
import type { VovkToolDerived } from './types';
import { ToModelOutput } from './ToModelOutput';
import type { ToModelOutputFn } from './types';
import { DefaultModelOutput } from './toModelOutputDefault';

// Standard tool input type
type DerivedToolInput = { body?: KnownAny; query?: KnownAny; params?: KnownAny };

type Handler = ((...args: KnownAny[]) => KnownAny) & {
  fn?: (input: unknown) => KnownAny;
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
  inputSchemas:
    | {
        body?: StandardSchemaV1;
        query?: StandardSchemaV1;
        params?: StandardSchemaV1;
      }
    | undefined;
  meta: Record<string, KnownAny> | undefined;
  handlerName: string;
  moduleName: string;
  toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
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
    let req;
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

    return [await toModelOutput(result, tool, req), req];
  } catch (e) {
    return [await toModelOutput(e as Error, tool, null), null];
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
  meta: Record<string, KnownAny> | undefined;
  toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
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
  const { schema, models } = handler;
  const inputSchemas = Object.fromEntries(
    (['body', 'query', 'params'] as const).map((key) => [key, models?.[key]]).filter(([, value]) => Boolean(value))
  );

  if (!schema || !schema.operationObject) {
    throw new Error(`Handler "${handlerName}" in module "${moduleName}" does not have a valid schema.`);
  }

  const execute = async (input: {
    body?: KnownAny;
    query?: KnownAny;
    params?: KnownAny;
  }): Promise<TFormattedOutput> => {
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
  };

  return tool;
};

// Base options type without toModelOutput
type DeriveToolsBaseOptions = {
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  onExecute?: (result: KnownAny, tool: VovkToolDerived, req: Pick<VovkRequest, 'vovk'> | null) => void;
  onError?: (error: Error, tool: VovkToolDerived, req: Pick<VovkRequest, 'vovk'> | null) => void;
};

// Return type helper
type DeriveToolsResult<TOutput, TFormattedOutput> = {
  tools: VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>[];
  toolsByName: Record<string, VovkToolDerived<DerivedToolInput, TOutput, TFormattedOutput>>;
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
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  toModelOutput?: ToModelOutputFn<TOutput, TFormattedOutput>;
  onExecute?: (result: unknown, tool: VovkToolDerived, req: Pick<VovkRequest, 'vovk'> | null) => void;
  onError?: (error: Error, tool: VovkToolDerived, req: Pick<VovkRequest, 'vovk'> | null) => void;
}): DeriveToolsResult<TOutput, TFormattedOutput> {
  const {
    modules,
    meta,
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<TOutput, TFormattedOutput>,
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
