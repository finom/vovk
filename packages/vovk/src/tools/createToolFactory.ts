import { StandardSchemaV1 } from '@standard-schema/spec';
import type { KnownAny, VovkErrorResponse, VovkValidationType } from '../types';
import type { VovkTool, VovkToolOptions } from './types';
import { ToModelOutput } from './ToModelOutput';
import type { ToModelOutputFn } from './types';
import type { DefaultModelOutput } from './toModelOutputDefault';

export function createToolFactory({
  toJSONSchema,
}: {
  toJSONSchema: (model: KnownAny, meta: { type: VovkValidationType }) => KnownAny;
}) {
  // Base options without input/output schemas
  type CreateToolBaseOptions<TOutput, TFormattedOutput> = {
    name: string;
    title?: string;
    description: string;
    onExecute?: (result: unknown, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
    onError?: (error: Error, options: { toolOptions: VovkToolOptions; processingMeta: unknown }) => void;
    toModelOutput?: ToModelOutputFn<TOutput, TFormattedOutput>;
  };

  // Options with input schema
  type WithInputSchema<TInput> = {
    inputSchema: StandardSchemaV1<TInput>;
  };

  // Options without input schema
  type WithoutInputSchema = {
    inputSchema?: undefined;
  };

  // Options with output schema
  type WithOutputSchema<TOutput> = {
    outputSchema: StandardSchemaV1<TOutput>;
  };

  // Options without output schema
  type WithoutOutputSchema = {
    outputSchema?: undefined;
  };

  type CreateToolResult<TInput, TOutput, TFormattedOutput> = VovkTool<TInput, TOutput, TFormattedOutput, false>;

  // Overload 1: with inputSchema, with outputSchema, with toModelOutput
  function createTool<TInput, TOutput, TFormattedOutput>(
    options: CreateToolBaseOptions<TOutput, TFormattedOutput> &
      WithInputSchema<TInput> &
      WithOutputSchema<TOutput> & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
      }
  ): CreateToolResult<TInput, TOutput, TFormattedOutput>;

  // Overload 2: with inputSchema, with outputSchema, without toModelOutput
  function createTool<TInput, TOutput>(
    options: CreateToolBaseOptions<TOutput, DefaultModelOutput<TOutput>> &
      WithInputSchema<TInput> &
      WithOutputSchema<TOutput> & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<TInput, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 3: with inputSchema, without outputSchema, with toModelOutput
  function createTool<TInput, TOutput, TFormattedOutput>(
    options: CreateToolBaseOptions<TOutput, TFormattedOutput> &
      WithInputSchema<TInput> &
      WithoutOutputSchema & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
      }
  ): CreateToolResult<TInput, TOutput, TFormattedOutput>;

  // Overload 4: with inputSchema, without outputSchema, without toModelOutput
  function createTool<TInput, TOutput>(
    options: CreateToolBaseOptions<TOutput, DefaultModelOutput<TOutput>> &
      WithInputSchema<TInput> &
      WithoutOutputSchema & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<TInput, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 5: without inputSchema, with outputSchema, with toModelOutput
  function createTool<TOutput, TFormattedOutput>(
    options: CreateToolBaseOptions<TOutput, TFormattedOutput> &
      WithoutInputSchema &
      WithOutputSchema<TOutput> & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
      }
  ): CreateToolResult<null, TOutput, TFormattedOutput>;

  // Overload 6: without inputSchema, with outputSchema, without toModelOutput
  function createTool<TOutput>(
    options: CreateToolBaseOptions<TOutput, DefaultModelOutput<TOutput>> &
      WithoutInputSchema &
      WithOutputSchema<TOutput> & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<null, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 7: without inputSchema, without outputSchema, with toModelOutput
  function createTool<TOutput, TFormattedOutput>(
    options: CreateToolBaseOptions<TOutput, TFormattedOutput> &
      WithoutInputSchema &
      WithoutOutputSchema & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: ToModelOutputFn<TOutput, TFormattedOutput>;
      }
  ): CreateToolResult<null, TOutput, TFormattedOutput>;

  // Overload 8: without inputSchema, without outputSchema, without toModelOutput
  function createTool<TOutput>(
    options: CreateToolBaseOptions<TOutput, DefaultModelOutput<TOutput>> &
      WithoutInputSchema &
      WithoutOutputSchema & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<null, TOutput, DefaultModelOutput<TOutput>>;

  // Implementation
  function createTool<TInput, TOutput, TFormattedOutput = DefaultModelOutput<TOutput>>({
    name,
    title,
    description,
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<TOutput, TFormattedOutput>,
    onExecute,
    onError,
    inputSchema,
    outputSchema,
    execute,
  }: CreateToolBaseOptions<TOutput, TFormattedOutput> & {
    inputSchema?: StandardSchemaV1<TInput>;
    outputSchema?: StandardSchemaV1<TOutput>;
    execute: (input: KnownAny, processingMeta?: unknown) => TOutput | Promise<TOutput>;
  }): VovkTool<TInput, TOutput, TFormattedOutput, false> {
    let parameters;
    return {
      type: 'function',
      name,
      title,
      description,
      get parameters() {
        return (parameters ??= inputSchema ? toJSONSchema(inputSchema, { type: 'tool-input' }) : {});
      },
      inputSchema: inputSchema as TInput extends undefined ? undefined : StandardSchemaV1<TInput>,
      outputSchema: outputSchema as TOutput extends undefined ? undefined : StandardSchemaV1<TOutput>,
      inputSchemas: undefined,
      async execute(input, processingMeta) {
        const toolOptions: VovkToolOptions = { name, title, description };
        let result: TOutput | Error;
        try {
          let validatedInput;

          if (inputSchema) {
            const validatedInputResult = await inputSchema['~standard'].validate(input);
            if (validatedInputResult.issues?.length) {
              throw new Error(
                `Input validation failed. ${validatedInputResult.issues
                  .map(({ message, path }) => `${message}${path ? ` at ${path.join('.')}` : ''}`)
                  .join(', ')}`
              );
            }
            validatedInput = (validatedInputResult as StandardSchemaV1.SuccessResult<TInput>).value;
          } else {
            validatedInput = null as TInput extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TInput> : null;
          }

          result = await (execute as (input: KnownAny, processingMeta: KnownAny) => TOutput | Promise<TOutput>)(
            validatedInput,
            processingMeta
          );
          if (outputSchema) {
            const validatedOutputResult = await outputSchema['~standard'].validate(result);
            if (validatedOutputResult.issues?.length) {
              throw new Error(
                `Output validation failed. ${validatedOutputResult.issues
                  .map(({ message, path }) => `${message}${path ? ` at ${path.join('.')}` : ''}`)
                  .join(', ')}`
              );
            }
            result = (validatedOutputResult as StandardSchemaV1.SuccessResult<TOutput>).value;
          }
          onExecute?.(result, { toolOptions, processingMeta });
        } catch (e) {
          onError?.(e as Error, { toolOptions, processingMeta });
          result = e as Error;
        }

        if (result instanceof Error) {
          (result as { toJSON?: () => Omit<VovkErrorResponse, 'statusCode'> }).toJSON = (): Omit<
            VovkErrorResponse,
            'statusCode'
          > => ({
            isError: true,
            message: result.message,
          });
        }

        return toModelOutput(result, { toolOptions, handlerSchema: null, req: null });
      },
    };
  }

  return createTool;
}
