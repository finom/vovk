import { HttpException } from '../core/http-exception.js';
import type { JSONLinesResponder } from '../core/json-lines-responder.js';
import type { VovkValidationType } from '../types/core.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { VovkRequest } from '../types/request.js';
import type { IsEmptyObject, KnownAny, NoInference, Prettify } from '../types/utils.js';
import type {
  CombinedSpec,
  ContentType,
  NormalizeContentType,
  NoSchema,
  ParsedBodyTypeFromContentType,
  ProcedureFnInput,
  ProcedureInput,
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
  TPreferTransformed extends boolean,
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
  preferTransformed?: TPreferTransformed;
  operationObject?: VovkOperationObject;
  target?: CombinedSpec.Target;
};

// what the handler gets from a schema: its output, or with preferTransformed: false, the value as it was sent
type Received<TSchema extends CombinedSpec, TPreferTransformed extends boolean> = [TPreferTransformed] extends [false]
  ? CombinedSpec.InferInput<TSchema>
  : CombinedSpec.InferOutput<TSchema>;

// without a params schema, the handler gets the route params as strings
type HandlerParams<TParams extends CombinedSpec, TPreferTransformed extends boolean> =
  unknown extends Received<TParams, TPreferTransformed>
    ? Record<string, string>
    : Received<TParams, TPreferTransformed>;

// req.vovk returns the validated values; req.json() and searchParams hold what the client sent
type HandlerRequest<
  TBody extends CombinedSpec,
  TQuery extends CombinedSpec,
  TParams extends CombinedSpec,
  TContentType extends ContentType | ContentType[],
  TPreferTransformed extends boolean,
> = VovkRequest<
  // without a body schema, the declared content type says what req.vovk.body() parses the body into
  unknown extends Received<TBody, TPreferTransformed>
    ? ParsedBodyTypeFromContentType<NormalizeContentType<TContentType>>
    : Received<TBody, TPreferTransformed>,
  Received<TQuery, TPreferTransformed>,
  HandlerParams<TParams, TPreferTransformed>,
  [TBody] extends [NoSchema]
    ? ParsedBodyTypeFromContentType<NormalizeContentType<TContentType>>
    : CombinedSpec.InferInput<TBody>,
  CombinedSpec.InferInput<TQuery>
>;

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

  // the input argument is optional when every key in it is
  type FnArgs<TInput> = IsEmptyObject<TInput> extends true ? [input?: TInput] : [input: TInput];

  // return type for procedure().handle(), stores THandleFn instead of ReturnType<THandleFn>
  // to avoid circular inference when the handler calls a service typed via the controller
  type BuilderHandleReturn<
    TBody extends CombinedSpec,
    TQuery extends CombinedSpec,
    TParams extends CombinedSpec,
    TOutput extends CombinedSpec,
    TIteration extends CombinedSpec,
    TContentType extends ContentType | ContentType[],
    TPreferTransformed extends boolean,
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny>,
    THandleFn extends (...args: KnownAny[]) => KnownAny = (...args: KnownAny[]) => KnownAny,
    TFnInput = Prettify<
      ProcedureFnInput<TBody, TQuery, TParams, NormalizeContentType<TContentType>> & {
        meta?: Record<string, KnownAny>;
        disableClientValidation?: boolean;
      }
    >,
  > = {
    (req: TReq, params: HandlerParams<TParams, TPreferTransformed>): KnownAny;
    __types: {
      body: Received<TBody, TPreferTransformed>;
      query: Received<TQuery, TPreferTransformed>;
      params: Received<TParams, TPreferTransformed>;
      output: unknown extends CombinedSpec.InferOutput<TOutput> ? KnownAny : CombinedSpec.InferOutput<TOutput>;
      iteration: TIteration extends CombinedSpec ? CombinedSpec.InferOutput<TIteration> : KnownAny;
      contentType: NormalizeContentType<TContentType>;
      // what a caller sends: a default, a coercion or a transform makes it differ from what the handler gets
      input: ProcedureInput<TBody, TQuery, TParams, NormalizeContentType<TContentType>>;
    };
    __handleFn: THandleFn;
    isRPC?: boolean;
    fn: {
      <TTransformed>(
        input: TFnInput & {
          transform: (
            data: FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>,
            fakeReq: Pick<TReq, 'vovk'>
          ) => TTransformed;
        }
      ): Promise<TTransformed>;
      // a type argument sets the result, the type the caller expects doesn't
      <TReturnType = FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>>(
        ...input: FnArgs<TFnInput>
      ): Promise<Awaited<NoInference<TReturnType>>>;
      (...input: FnArgs<TFnInput>): Promise<FnResult<THandleFn, CombinedSpec.InferOutput<TIteration>>>;
    };
    definition: KnownAny;
    schema: KnownAny;
    wrapper?: KnownAny;
  };

  // a schema left out gets NoSchema, so a schema whose input type is unknown, such as z.unknown(), still counts
  function procedure<
    TBody extends CombinedSpec = NoSchema,
    TQuery extends CombinedSpec = NoSchema,
    TParams extends CombinedSpec = NoSchema,
    TOutput extends CombinedSpec = NoSchema,
    TIteration extends CombinedSpec = NoSchema,
    TContentType extends ContentType | ContentType[] = ['application/json'],
    TPreferTransformed extends boolean = true,
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny> = HandlerRequest<
      TBody,
      TQuery,
      TParams,
      TContentType,
      TPreferTransformed
    >,
  >(
    options?: ProcedureOptions<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TPreferTransformed>
  ): BuilderHandleReturn<TBody, TQuery, TParams, TOutput, TIteration, TContentType, TPreferTransformed, TReq> & {
    handle: unknown extends CombinedSpec.InferOutput<TOutput>
      ? <THandleFn extends (req: TReq, params: HandlerParams<TParams, TPreferTransformed>) => KnownAny>(
          fn: THandleFn
        ) => BuilderHandleReturn<
          TBody,
          TQuery,
          TParams,
          TOutput,
          TIteration,
          TContentType,
          TPreferTransformed,
          TReq,
          THandleFn
        >
      : // the schema validates what the handler returns, so the handler returns its input; fn() gets its output
        (
          fn: (
            req: TReq,
            params: HandlerParams<TParams, TPreferTransformed>
          ) => HandleReturnType<CombinedSpec.InferInput<TOutput>, CombinedSpec.InferInput<TIteration>>
        ) => BuilderHandleReturn<
          TBody,
          TQuery,
          TParams,
          TOutput,
          TIteration,
          TContentType,
          TPreferTransformed,
          TReq,
          (
            req: TReq,
            params: HandlerParams<TParams, TPreferTransformed>
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
