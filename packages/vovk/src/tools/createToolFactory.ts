import { StandardSchemaV1, StandardJSONSchemaV1 } from '@standard-schema/spec';
import type { VovkErrorResponse, VovkValidationType } from '../types';
import type { VovkToolNonDerived } from './types';
import { ToModelOutput } from './ToModelOutput';
import type { ToModelOutputFn } from './types';
import type { DefaultModelOutput, ToModelOutputDefaultFn } from './toModelOutputDefault';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

// Helper type to extract the formatted output type from a toModelOutput function
type InferFormattedOutput<TFn, TOutput> = TFn extends ToModelOutputDefaultFn
  ? DefaultModelOutput<TOutput>
  : TFn extends (...args: KnownAny[]) => infer R
    ? R extends Promise<infer U>
      ? U
      : R
    : unknown;

// Flexible constraint for toModelOutput functions
type AnyToModelOutputFn = (...args: KnownAny[]) => KnownAny;

export function createToolFactory({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { validationType: VovkValidationType; target: StandardJSONSchemaV1.Target | undefined }
  ) => KnownAny;
}) {
  // Base options without toModelOutput
  type CreateToolBaseOptions<TInput, TOutput, TFormattedOutput> = {
    name: string;
    title?: string;
    description: string;
    onExecute?: (result: unknown, tool: VovkToolNonDerived<TInput, TOutput, TFormattedOutput>) => void;
    onError?: (error: Error, tool: VovkToolNonDerived<TInput, TOutput, TFormattedOutput>) => void;
    target?: StandardJSONSchemaV1.Target;
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

  type CreateToolResult<TInput, TOutput, TFormattedOutput> = VovkToolNonDerived<TInput, TOutput, TFormattedOutput>;

  // Overload 1: with inputSchema, with outputSchema, with toModelOutput
  function createTool<TInput, TOutput, TToModelOutput extends AnyToModelOutputFn>(
    options: CreateToolBaseOptions<TInput, TOutput, InferFormattedOutput<TToModelOutput, TOutput>> &
      WithInputSchema<TInput> &
      WithOutputSchema<TOutput> & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: TToModelOutput;
      }
  ): CreateToolResult<TInput, TOutput, InferFormattedOutput<TToModelOutput, TOutput>>;

  // Overload 2: with inputSchema, with outputSchema, without toModelOutput
  function createTool<TInput, TOutput>(
    options: CreateToolBaseOptions<TInput, TOutput, DefaultModelOutput<TOutput>> &
      WithInputSchema<TInput> &
      WithOutputSchema<TOutput> & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<TInput, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 3: with inputSchema, without outputSchema, with toModelOutput
  function createTool<TInput, TOutput, TToModelOutput extends AnyToModelOutputFn>(
    options: CreateToolBaseOptions<TInput, TOutput, InferFormattedOutput<TToModelOutput, TOutput>> &
      WithInputSchema<TInput> &
      WithoutOutputSchema & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: TToModelOutput;
      }
  ): CreateToolResult<TInput, TOutput, InferFormattedOutput<TToModelOutput, TOutput>>;

  // Overload 4: with inputSchema, without outputSchema, without toModelOutput
  function createTool<TInput, TOutput>(
    options: CreateToolBaseOptions<TInput, TOutput, DefaultModelOutput<TOutput>> &
      WithInputSchema<TInput> &
      WithoutOutputSchema & {
        execute: (input: TInput, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<TInput, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 5: without inputSchema, with outputSchema, with toModelOutput
  function createTool<TOutput, TToModelOutput extends AnyToModelOutputFn>(
    options: CreateToolBaseOptions<null, TOutput, InferFormattedOutput<TToModelOutput, TOutput>> &
      WithoutInputSchema &
      WithOutputSchema<TOutput> & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: TToModelOutput;
      }
  ): CreateToolResult<null, TOutput, InferFormattedOutput<TToModelOutput, TOutput>>;

  // Overload 6: without inputSchema, with outputSchema, without toModelOutput
  function createTool<TOutput>(
    options: CreateToolBaseOptions<null, TOutput, DefaultModelOutput<TOutput>> &
      WithoutInputSchema &
      WithOutputSchema<TOutput> & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput?: undefined;
      }
  ): CreateToolResult<null, TOutput, DefaultModelOutput<TOutput>>;

  // Overload 7: without inputSchema, without outputSchema, with toModelOutput
  function createTool<TOutput, TToModelOutput extends AnyToModelOutputFn>(
    options: CreateToolBaseOptions<null, TOutput, InferFormattedOutput<TToModelOutput, TOutput>> &
      WithoutInputSchema &
      WithoutOutputSchema & {
        execute: (input: null, processingMeta?: unknown) => TOutput | Promise<TOutput>;
        toModelOutput: TToModelOutput;
      }
  ): CreateToolResult<null, TOutput, InferFormattedOutput<TToModelOutput, TOutput>>;

  // Overload 8: without inputSchema, without outputSchema, without toModelOutput
  function createTool<TOutput>(
    options: CreateToolBaseOptions<null, TOutput, DefaultModelOutput<TOutput>> &
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
    toModelOutput = ToModelOutput.DEFAULT as ToModelOutputFn<TInput, TOutput, TFormattedOutput>,
    onExecute,
    onError,
    inputSchema,
    outputSchema,
    execute,
    target,
  }: CreateToolBaseOptions<TInput, TOutput, TFormattedOutput> & {
    inputSchema?: StandardSchemaV1<TInput>;
    outputSchema?: StandardSchemaV1<TOutput>;
    execute: (input: KnownAny, processingMeta?: unknown) => TOutput | Promise<TOutput>;
    toModelOutput?: ToModelOutputFn<TInput, TOutput, TFormattedOutput>;
  }): VovkToolNonDerived<TInput, TOutput, TFormattedOutput> {
    let parameters;
    const tool: VovkToolNonDerived<TInput, TOutput, TFormattedOutput> = {
      type: 'function',
      name,
      title,
      description,
      get parameters() {
        return (parameters ??= inputSchema ? toJSONSchema(inputSchema, { validationType: 'tool-input', target }) : {});
      },
      inputSchema: inputSchema as TInput extends undefined ? undefined : StandardSchemaV1<TInput>,
      outputSchema: outputSchema as TOutput extends undefined ? undefined : StandardSchemaV1<TOutput>,
      inputSchemas: undefined,
      async execute(input, processingMeta) {
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
          onExecute?.(result, tool);
        } catch (e) {
          onError?.(e as Error, tool);
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

        return toModelOutput(result, tool, null);
      },
    };
    return tool;
  }

  return createTool;
}
