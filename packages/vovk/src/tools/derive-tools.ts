import { readableStreamToAsyncIterable } from '../client/default-stream-handler.js';
import { applyDecorateDecorators } from '../core/decorate.js';
import { HttpException } from '../core/http-exception.js';
import { JSONLinesResponder } from '../core/json-lines-responder.js';
import type { VovkHandlerSchema, VovkSegmentSchema } from '../types/core.js';
import type { VovkRequest } from '../types/request.js';
import type { StandardToolV0 } from '../types/standard-tool.js';
import type { ToModelOutputFn } from '../types/tools.js';
import type { CombinedSpec } from '../types/validation.js';
import {
  jsonSchemasObjectToSingleJSONSchemaOnlySpec,
  jsonSchemaToJSONSchemaOnlySpec,
} from '../validation/json-schema-only-spec.js';
import type { procedure } from '../validation/procedure.js';
import { validationSchemasObjectToSingleValidationSchema } from '../validation/validation-schemas-object-to-single-validation-schema.js';
import { responseErrorMessage } from './to-model-error-message.js';
import { ToModelOutput } from './to-model-output.js';
import type { DefaultModelOutput } from './to-model-output-default.js';

// Standard tool input type
type DerivedToolInput = { body?: unknown; query?: unknown; params?: unknown };

type Handler = ((...args: unknown[]) => unknown) & {
  fn?: (input: unknown) => [unknown, Pick<VovkRequest, 'vovk'> | null];
  isRPC?: boolean;
  schema?: VovkHandlerSchema;
  segmentSchema?: Pick<VovkSegmentSchema, 'segmentType'>;
  definition?: Parameters<typeof procedure>[0];
};

type CallerInput<TOutput, TFormattedOutput> = {
  handler: Handler;
  body: unknown;
  query: unknown;
  params: unknown;
  schema: VovkHandlerSchema | undefined;
  meta: Record<string, unknown> | undefined;
  handlerName: string;
  moduleName: string;
  toModelOutput: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
};

const MAX_TOOL_NAME_LENGTH = 64;

// FNV-1a, tells apart two names cut to the same prefix
const hashName = (name: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

// model APIs take a name of up to 64 characters from A-Z, a-z, 0-9, _ and -
const toToolName = (name: string) => {
  const safeName = name.replace(/[^A-Za-z0-9_-]/g, '_');
  return safeName.length > MAX_TOOL_NAME_LENGTH
    ? `${safeName.slice(0, MAX_TOOL_NAME_LENGTH - 9)}_${hashName(name)}`
    : safeName;
};

function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  return typeof (value as AsyncIterable<unknown>)?.[Symbol.asyncIterator] === 'function';
}

async function caller<TOutput, TFormattedOutput>(
  { handler, handlerName, body, query, params, meta, toModelOutput }: CallerInput<TOutput, TFormattedOutput>,
  tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>
): Promise<[TFormattedOutput, Pick<VovkRequest, 'vovk'> | null, Error | null]> {
  if (!handler.isRPC && !handler.fn) {
    throw new Error('Handler is not a valid RPC or controller method');
  }
  try {
    let result: unknown;
    let req = null;
    if (handler.isRPC) {
      result = await handler({
        handler,
        body,
        query,
        params,
        // an OpenAPI mixin calls a third-party host, the app's meta stays home
        meta: handler.segmentSchema?.segmentType === 'mixin' ? undefined : meta,
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

    // an error status fails the call, the formatter still gets the Response to show its body
    if (result instanceof Response && !result.ok) {
      const error = new HttpException(result.status, await responseErrorMessage(result.clone()));
      return [
        await toModelOutput(result as TOutput, tool as StandardToolV0<unknown, TOutput, TFormattedOutput>, req),
        req,
        error,
      ];
    }

    // a responder streams the lines a client would read
    if (result instanceof JSONLinesResponder && result.readableStream) {
      result = readableStreamToAsyncIterable({ readableStream: result.readableStream });
    }

    // a streaming handler yields its items, collect them so the model sees data instead of an iterator
    if (isAsyncIterable(result)) {
      const items: unknown[] = [];
      for await (const item of result) items.push(item);
      result = items;
    }

    return [
      await toModelOutput(result as TOutput, tool as StandardToolV0<unknown, TOutput, TFormattedOutput>, req),
      req,
      null,
    ];
  } catch (e) {
    // report the error separately, the formatted output is never an Error instance
    return [
      await toModelOutput(e as Error, tool as StandardToolV0<unknown, TOutput, TFormattedOutput>, null),
      null,
      e as Error,
    ];
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
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError: (
    error: Error,
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
}): StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput> => {
  if (!module) {
    throw new Error(`Module "${moduleName}" not found.`);
  }

  const handler = module[handlerName];
  if (!handler) {
    throw new Error(`Handler "${handlerName}" not found in module "${moduleName}".`);
  }
  const { schema, definition } = handler;

  const name = toToolName(schema?.operationObject?.['x-tool']?.name ?? `${moduleName}_${handlerName}`);

  const inputSchemas = Object.fromEntries(
    (['body', 'query', 'params'] as const).map((key) => [key, definition?.[key]]).filter(([, value]) => Boolean(value))
  ) as { body?: CombinedSpec; query?: CombinedSpec; params?: CombinedSpec };

  // prefer real Standard Schemas from `definition` (procedures); RPC modules only have JSON Schemas
  // in `schema.validation`, so wrap those (envelope-only validate, see json-schema-only-spec.ts)
  const inputSchema =
    Object.keys(inputSchemas).length > 0
      ? validationSchemasObjectToSingleValidationSchema(inputSchemas)
      : jsonSchemasObjectToSingleJSONSchemaOnlySpec({
          schemas: {
            body: schema?.validation?.body,
            query: schema?.validation?.query,
            params: schema?.validation?.params,
          },
        });
  const outputSchema =
    definition?.output ??
    (schema?.validation?.output ? jsonSchemaToJSONSchemaOnlySpec({ jsonSchema: schema.validation.output }) : undefined);

  const execute = async (input: { body?: unknown; query?: unknown; params?: unknown }): Promise<TFormattedOutput> => {
    // a tool without input may be called with nothing
    const { body, query, params } = input ?? {};

    const callerInput: CallerInput<TOutput, TFormattedOutput> = {
      schema,
      handler,
      body,
      query,
      params,
      meta,
      handlerName,
      moduleName,
      toModelOutput,
    };

    const [result, req, error] = await caller(callerInput, tool);
    if (error) {
      onError(error, tool, req);
    } else {
      onExecute(result, tool, req);
    }

    return result;
  };
  const tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput> = {
    execute,
    name,
    inputSchema: inputSchema as StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>['inputSchema'],
    outputSchema: outputSchema as StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>['outputSchema'],
    title: schema?.operationObject?.['x-tool']?.title ?? schema?.operationObject?.summary,
    // static tool data from @operation.tool({ meta }), not the runtime `meta` handed to handlers
    meta: schema?.operationObject?.['x-tool']?.meta,
    description:
      schema?.operationObject?.['x-tool']?.description ??
      ([schema?.operationObject?.summary ?? '', schema?.operationObject?.description ?? '']
        .filter(Boolean)
        .join('\n') ||
        handlerName),
  };

  return tool;
};

// Base options type without toModelOutput
type DeriveToolsBaseOptions<TOutput = unknown, TFormattedOutput = unknown> = {
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  onExecute?: (
    result: unknown,
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError?: (
    error: Error,
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
};

/**
 * Derives AI tools from controllers and RPC modules.
 * @see https://vovk.dev/tools
 * @example
 * ```ts
 * import { deriveTools, ToModelOutput } from 'vovk';
 * import { UserRPC } from '@/client';
 *
 * const tools = deriveTools({
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
): StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>[];

// Overload: with toModelOutput - infers TFormattedOutput from the function
export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(
  options: DeriveToolsBaseOptions & {
    toModelOutput: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
  }
): StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>[];

export function deriveTools<TOutput = unknown, TFormattedOutput = unknown>(options: {
  modules: Record<string, object>;
  meta?: Record<string, unknown>;
  toModelOutput?: ToModelOutputFn<unknown, TOutput, TFormattedOutput>;
  onExecute?: (
    result: unknown,
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
  onError?: (
    error: Error,
    tool: StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>,
    req: Pick<VovkRequest, 'vovk'> | null
  ) => void;
}): StandardToolV0<DerivedToolInput, TOutput, TFormattedOutput>[] {
  const {
    modules,
    meta,
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<unknown, TOutput, TFormattedOutput>,
    onExecute = (result) => result,
    onError = () => {},
  } = options;

  // a tools route may load a controller without its segment, whose initSegment applies the decorate() decorators
  for (const module of Object.values(modules ?? {})) {
    if (typeof module === 'function') applyDecorateDecorators(module);
  }

  // tool name to the module and handler it came from
  const sources = new Map<string, string>();

  return Object.entries(
    (modules as Record<string, Record<string, Handler & { schema?: VovkHandlerSchema }>>) ?? {}
  ).flatMap(([moduleName, module]) => {
    return Object.entries(module ?? {})
      .filter(
        ([, handler]) => handler?.schema?.operationObject && !handler?.schema?.operationObject?.['x-tool']?.hidden
      )
      .map(([handlerName]) => {
        const tool = makeTool<TOutput, TFormattedOutput>({
          moduleName,
          handlerName,
          module,
          meta,
          toModelOutput,
          onExecute,
          onError,
        });
        const source = `${moduleName}.${handlerName}`;
        const taken = sources.get(tool.name);
        if (taken) {
          throw new Error(
            `Tool name "${tool.name}" is derived for both ${taken} and ${source}. Set another one with x-tool.name.`
          );
        }
        sources.set(tool.name, source);
        return tool;
      });
  });
}
