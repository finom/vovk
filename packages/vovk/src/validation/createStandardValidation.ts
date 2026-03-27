import { withValidationLibrary } from './withValidationLibrary.js';
import { HttpException } from '../core/HttpException.js';
import { createToolFactory } from '../tools/createToolFactory.js';
import { HttpStatus } from './createValidateOnClient.js';
import type { VovkRequest } from '../types/request.js';
import type { CombinedSpec, ContentType, NormalizeContentType } from '../types/validation.js';
import type { VovkValidationType } from '../types/core.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { KnownAny } from '../types/utils.js';

type ProcedureOptions<
  TBody extends CombinedSpec,
  TQuery extends CombinedSpec,
  TParams extends CombinedSpec,
  TOutput extends CombinedSpec,
  TIteration extends CombinedSpec,
  TContentType extends ContentType | ContentType[],
> = {
  contentType?: TContentType;
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  output?: TOutput;
  iteration?: TIteration;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  preferTransformed?: boolean;
  operationObject?: VovkOperationObject;
  target?: CombinedSpec.Target;
};

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { validationType: VovkValidationType; target: CombinedSpec.Target | undefined }
  ) => KnownAny;
}) {
  function callWithValidationLibrary(options: KnownAny, handle: (...args: KnownAny[]) => KnownAny) {
    const normalizedContentType = (
      typeof options.contentType === 'string' ? [options.contentType] : options.contentType
    ) as KnownAny;
    return withValidationLibrary({
      contentType: normalizedContentType,
      body: options.body,
      query: options.query,
      params: options.params,
      output: options.output,
      iteration: options.iteration,
      disableServerSideValidation: options.disableServerSideValidation,
      skipSchemaEmission: options.skipSchemaEmission,
      validateEachIteration: options.validateEachIteration,
      handle: handle as KnownAny,
      toJSONSchema: (model, opts) =>
        toJSONSchema(model, { validationType: opts.validationType, target: options.target }),
      validate: async (data, model: KnownAny, { validationType, i }) => {
        const result = await model['~standard'].validate(data);
        if (result.issues?.length) {
          throw new HttpException(
            HttpStatus.BAD_REQUEST,
            `Validation failed. Invalid ${validationType === 'iteration' ? `${validationType} #${i}` : validationType}: ${result.issues
              .map(
                ({ message, path }: { message: string; path?: string[] }) =>
                  `${message}${path ? ` at ${path.join('.')}` : ''}`
              )
              .join(', ')}`,
            { issues: result.issues }
          );
        }

        return (result as CombinedSpec.SuccessResult<typeof model>).value;
      },
      preferTransformed: options.preferTransformed,
      operationObject: options.operationObject,
    });
  }

  // Compute handle return type: concrete when output schema exists, KnownAny otherwise
  type HandleReturnType<TOutput extends CombinedSpec, TIteration extends CombinedSpec> =
    unknown extends CombinedSpec.InferOutput<TOutput>
      ? KnownAny
      :
          | CombinedSpec.InferOutput<TOutput>
          | Promise<CombinedSpec.InferOutput<TOutput>>
          | (unknown extends CombinedSpec.InferOutput<TIteration>
              ? never
              : AsyncGenerator<CombinedSpec.InferOutput<TIteration>>);

  // Return type for procedure().handle() — preserves VovkBody/VovkOutput/VovkReturnType extraction
  // Stores the handler function type (THandleFn) instead of eagerly resolving its return type.
  // This breaks circular type inference when the handler callback calls a service whose
  // param types reference the controller — TypeScript captures THandleFn structurally
  // without resolving ReturnType<THandleFn>, which is computed lazily when queried.
  type BuilderHandleReturn<
    TBody extends CombinedSpec,
    TQuery extends CombinedSpec,
    TParams extends CombinedSpec,
    TOutput extends CombinedSpec,
    TIteration extends CombinedSpec,
    TContentType extends ContentType | ContentType[],
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny>,
    THandleFn extends (...args: KnownAny[]) => KnownAny = (...args: KnownAny[]) => KnownAny,
  > = {
    (
      req: TReq,
      params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : Record<string, string>
    ): KnownAny;
    __types: {
      body: TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : KnownAny;
      query: TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : KnownAny;
      params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : KnownAny;
      output: unknown extends CombinedSpec.InferOutput<TOutput> ? KnownAny : CombinedSpec.InferOutput<TOutput>;
      iteration: TIteration extends CombinedSpec ? CombinedSpec.InferOutput<TIteration> : KnownAny;
      contentType: NormalizeContentType<TContentType>;
    };
    __handleFn: THandleFn;
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body?: TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
        transform: (data: Awaited<ReturnType<THandleFn>>, fakeReq: Pick<TReq, 'vovk'>) => TTransformed;
      }): Promise<TTransformed>;
      <TReturnType = ReturnType<THandleFn>>(input?: {
        body?: TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
      }): TReturnType;
      (input?: {
        body?: TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
      }): ReturnType<THandleFn>;
    };
    definition: KnownAny;
    schema: KnownAny;
    wrapper?: KnownAny;
  };

  function procedure<
    TBody extends CombinedSpec,
    TQuery extends CombinedSpec,
    TParams extends CombinedSpec,
    TOutput extends CombinedSpec,
    TIteration extends CombinedSpec,
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
      TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : undefined,
      TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : undefined,
      TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : undefined
    >,
    TContentType extends ContentType | ContentType[] = ['application/json'],
  >(
    options?: ProcedureOptions<TBody, TQuery, TParams, TOutput, TIteration, TContentType>
  ): BuilderHandleReturn<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TReq> & {
    handle: unknown extends CombinedSpec.InferOutput<TOutput>
      ? <
          THandleFn extends (
            req: TReq,
            params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : Record<string, string>
          ) => KnownAny,
        >(
          fn: THandleFn
        ) => BuilderHandleReturn<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TReq, THandleFn>
      : (
          fn: (
            req: TReq,
            params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : Record<string, string>
          ) => HandleReturnType<TOutput, TIteration>
        ) => BuilderHandleReturn<
          TBody,
          TQuery,
          TParams,
          TOutput,
          TIteration,
          TContentType,
          TReq,
          (
            req: TReq,
            params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : Record<string, string>
          ) => HandleReturnType<TOutput, TIteration>
        >;
  };

  // Implementation
  function procedure(options?: KnownAny): KnownAny {
    const notImplementedHandler = callWithValidationLibrary(options ?? {}, () => {
      throw new HttpException(HttpStatus.NOT_IMPLEMENTED, 'Not implemented');
    });

    return Object.assign(notImplementedHandler, {
      handle(fn: (...args: KnownAny[]) => KnownAny) {
        return callWithValidationLibrary(options ?? {}, fn);
      },
    });
  }

  return Object.assign(procedure, { createTool: createToolFactory({ toJSONSchema }) });
}
