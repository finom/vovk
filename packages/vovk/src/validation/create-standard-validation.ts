import { HttpException } from '../core/http-exception.js';
import type { JSONLinesResponder } from '../core/json-lines-responder.js';
import type { VovkValidationType } from '../types/core.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { VovkRequest } from '../types/request.js';
import type { KnownAny, NoInference } from '../types/utils.js';
import type {
  BodyTypeFromContentType,
  CombinedSpec,
  ContentType,
  NormalizeContentType,
  ParsedBodyTypeFromContentType,
} from '../types/validation.js';
import { HttpStatus } from './create-validate-on-client.js';
import { withValidationLibrary } from './with-validation-library.js';

// an array of 100 000 wrong items has as many issues: a validation error lists the first ones, in its message and cause
const MAX_ISSUES = 20;

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

// without a params schema, the handler gets the route params as strings
type ParamsOutput<TParams extends CombinedSpec> =
  unknown extends CombinedSpec.InferOutput<TParams> ? Record<string, string> : CombinedSpec.InferOutput<TParams>;

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
          const issues = result.issues.slice(0, MAX_ISSUES);
          const moreIssues = result.issues.length - issues.length;
          const message = `Validation failed. Invalid ${validationType === 'iteration' ? `${validationType} #${i}` : validationType}: ${issues
            .map(
              // a path segment is a key or, in valibot and others, an object that holds the key
              ({ message, path }: { message: string; path?: readonly (PropertyKey | { key: PropertyKey })[] }) =>
                `${message}${path?.length ? ` at ${path.map((segment) => String(typeof segment === 'object' ? segment.key : segment)).join('.')}` : ''}`
            )
            .join(', ')}${moreIssues ? `, and ${moreIssues} more` : ''}`;
          // output and iterations are the handler's own data, and some libraries copy it into the issues:
          // without a status code the error is internal, so production answers 500 and keeps the issues on the server
          if (validationType === 'output' || validationType === 'iteration') {
            throw new Error(message, { cause: { issues } });
          }
          throw new HttpException(HttpStatus.BAD_REQUEST, message, { issues });
        }

        return (result as CombinedSpec.SuccessResult<typeof model>).value;
      },
      preferTransformed: options.preferTransformed,
      operationObject: options.operationObject,
    });
  }

  // the return of a handler with an output schema
  type HandleReturnType<TOutputValue, TIterationValue> =
    | TOutputValue
    | Promise<TOutputValue>
    | (unknown extends TIterationValue ? never : AsyncGenerator<TIterationValue>);

  // what fn() resolves to: the handler's result, or with an iteration schema, an async generator of the validated items
  type FnResult<THandleFn extends (...args: KnownAny[]) => KnownAny, TIterationValue> = unknown extends TIterationValue
    ? Awaited<ReturnType<THandleFn>>
    : Awaited<ReturnType<THandleFn>> extends JSONLinesResponder<KnownAny>
      ? Awaited<ReturnType<THandleFn>>
      : AsyncGenerator<TIterationValue, void, unknown>;

  // return type for procedure().handle(), stores THandleFn instead of ReturnType<THandleFn>
  // to avoid circular inference when the handler calls a service typed via the controller
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
    (req: TReq, params: ParamsOutput<TParams>): KnownAny;
    __types: {
      body: TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : KnownAny;
      query: TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : KnownAny;
      params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : KnownAny;
      output: unknown extends CombinedSpec.InferOutput<TOutput> ? KnownAny : CombinedSpec.InferOutput<TOutput>;
      iteration: TIteration extends CombinedSpec ? CombinedSpec.InferOutput<TIteration> : KnownAny;
      contentType: NormalizeContentType<TContentType>;
      // what a caller sends: a default, a coercion or a transform makes it differ from what the handler gets
      bodyInput: CombinedSpec.InferInput<TBody>;
      queryInput: CombinedSpec.InferInput<TQuery>;
      paramsInput: CombinedSpec.InferInput<TParams>;
    };
    __handleFn: THandleFn;
    isRPC?: boolean;
    fn: {
      <TTransformed>(input: {
        body?: TBody extends CombinedSpec
          ? BodyTypeFromContentType<NormalizeContentType<TContentType>, CombinedSpec.InferInput<TBody>>
          : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferInput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferInput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
        transform: (
          data: FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>,
          fakeReq: Pick<TReq, 'vovk'>
        ) => TTransformed;
      }): Promise<TTransformed>;
      // a type argument sets the result, the type the caller expects doesn't
      <TReturnType = FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>>(input?: {
        body?: TBody extends CombinedSpec
          ? BodyTypeFromContentType<NormalizeContentType<TContentType>, CombinedSpec.InferInput<TBody>>
          : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferInput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferInput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
      }): Promise<Awaited<NoInference<TReturnType>>>;
      (input?: {
        body?: TBody extends CombinedSpec
          ? BodyTypeFromContentType<NormalizeContentType<TContentType>, CombinedSpec.InferInput<TBody>>
          : undefined;
        query?: TQuery extends CombinedSpec ? CombinedSpec.InferInput<TQuery> : undefined;
        params?: TParams extends CombinedSpec ? CombinedSpec.InferInput<TParams> : undefined;
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
      }): Promise<FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>>;
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
    TContentType extends ContentType | ContentType[] = ['application/json'],
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
      // without a body schema, the declared content type says what req.vovk.body() parses the body into
      unknown extends CombinedSpec.InferOutput<TBody>
        ? ParsedBodyTypeFromContentType<NormalizeContentType<TContentType>>
        : CombinedSpec.InferOutput<TBody>,
      TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : undefined,
      ParamsOutput<TParams>
    >,
  >(
    options?: ProcedureOptions<TBody, TQuery, TParams, TOutput, TIteration, TContentType>
  ): BuilderHandleReturn<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TReq> & {
    handle: unknown extends CombinedSpec.InferOutput<TOutput>
      ? <THandleFn extends (req: TReq, params: ParamsOutput<TParams>) => KnownAny>(
          fn: THandleFn
        ) => BuilderHandleReturn<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TReq, THandleFn>
      : // the schema validates what the handler returns, so the handler returns its input; fn() gets its output
        (
          fn: (
            req: TReq,
            params: ParamsOutput<TParams>
          ) => HandleReturnType<CombinedSpec.InferInput<TOutput>, CombinedSpec.InferInput<TIteration>>
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
            params: ParamsOutput<TParams>
          ) => HandleReturnType<CombinedSpec.InferOutput<TOutput>, CombinedSpec.InferOutput<TIteration>>
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

  return procedure;
}
