import { HttpException } from '../core/http-exception.js';
import type { JSONLinesResponder } from '../core/json-lines-responder.js';
import type { VovkValidationType } from '../types/core.js';
import type { VovkOperationObject } from '../types/operation.js';
import type { VovkRequest } from '../types/request.js';
import type { IsEmptyObject, KnownAny, Prettify, VovkNoInference } from '../types/utils.js';
import type {
  CombinedSpec,
  ContentType,
  NormalizeContentType,
  ParsedBodyTypeFromContentType,
  ProcedureFnInput,
  VovkNoSchema,
  VovkProcedureInput,
} from '../types/validation.js';
import { HttpStatus } from './create-validate-on-client.js';
import { withValidationLibrary } from './with-validation-library.js';

// an array of 100 000 wrong items has as many issues: a validation error lists the first ones, in its message and cause
const MAX_ISSUES = 20;

// the fields of an issue that copy the value that failed: Valibot's input and received, ArkType's data and actual
const INPUT_FIELDS = new Set(['input', 'received', 'data', 'actual']);

type Issue = { message: string; path?: readonly (PropertyKey | { key: PropertyKey })[]; toJSON?: () => object };

// an issue as an error carries it: the library's own plain fields and the path as keys. A whole Valibot issue holds
// the input in several places, and a union nests more issues, so it can be many times the size of the request
const toIssue = (issue: Issue) => {
  // what JSON.stringify reads, as ArkType's toJSON()
  const source = typeof issue.toJSON === 'function' ? issue.toJSON() : issue;
  const fields = Object.entries(source).filter(
    ([key, value]) =>
      key !== 'path' &&
      !INPUT_FIELDS.has(key) &&
      (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  );
  return {
    ...Object.fromEntries(fields),
    message: issue.message,
    ...(issue.path ? { path: issue.path.map((segment) => (typeof segment === 'object' ? segment.key : segment)) } : {}),
  };
};

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
  [TBody] extends [VovkNoSchema]
    ? ParsedBodyTypeFromContentType<NormalizeContentType<TContentType>>
    : CombinedSpec.InferInput<TBody>,
  CombinedSpec.InferInput<TQuery>
>;

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { validationType: VovkValidationType; target: CombinedSpec.Target | undefined; io: 'input' | 'output' }
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
        toJSONSchema(model, {
          validationType: opts.validationType,
          target: options.target,
          // the server sends the output and the items as the schema parses them, unless preferTransformed is off
          io:
            (opts.validationType === 'output' || opts.validationType === 'iteration') &&
            options.preferTransformed !== false
              ? 'output'
              : 'input',
        }),
      validate: async (data, model: KnownAny, { validationType, i }) => {
        const result = await model['~standard'].validate(data);
        if (result.issues?.length) {
          // a plain array: slice() and map() keep an Array subclass, such as ArkType's ArkErrors before 2.2.2, whose
          // toJSON fails on the mapped issues
          const { issues: allIssues } = result as { issues: Issue[] };
          const count = Math.min(allIssues.length, MAX_ISSUES);
          const issues = Array.from({ length: count }, (_, index) => toIssue(allIssues[index]));
          const moreIssues = result.issues.length - issues.length;
          const message = `Validation failed. Invalid ${validationType === 'iteration' ? `${validationType} #${i}` : validationType}: ${issues
            .map(({ message, path }) => `${message}${path?.length ? ` at ${path.map(String).join('.')}` : ''}`)
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
      // what is sent, as the handler gives it with preferTransformed: false
      output: unknown extends CombinedSpec.InferOutput<TOutput> ? KnownAny : Received<TOutput, TPreferTransformed>;
      iteration: Received<TIteration, TPreferTransformed>;
      contentType: NormalizeContentType<TContentType>;
      // what a caller sends: a default, a coercion or a transform makes it differ from what the handler gets
      input: VovkProcedureInput<TBody, TQuery, TParams, NormalizeContentType<TContentType>>;
    };
    __handleFn: THandleFn;
    isRPC?: boolean;
    fn: {
      <TTransformed>(
        input: TFnInput & {
          transform: (
            data: FnResult<THandleFn, Received<TIteration, TPreferTransformed>>,
            fakeReq: Pick<TReq, 'vovk'>
          ) => TTransformed;
        }
      ): Promise<TTransformed>;
      // a type argument sets the result, the type the caller expects doesn't
      <TReturnType = FnResult<THandleFn, Received<TIteration, TPreferTransformed>>>(
        ...input: FnArgs<TFnInput>
      ): Promise<Awaited<VovkNoInference<TReturnType>>>;
      (...input: FnArgs<TFnInput>): Promise<FnResult<THandleFn, Received<TIteration, TPreferTransformed>>>;
    };
    definition: KnownAny;
    schema: KnownAny;
  };

  // a schema left out gets VovkNoSchema, so a schema whose input type is unknown, such as z.unknown(), still counts
  function procedure<
    TBody extends CombinedSpec = VovkNoSchema,
    TQuery extends CombinedSpec = VovkNoSchema,
    TParams extends CombinedSpec = VovkNoSchema,
    TOutput extends CombinedSpec = VovkNoSchema,
    TIteration extends CombinedSpec = VovkNoSchema,
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
      : // the schema validates what the handler returns, so the handler returns its input; fn() gets what is sent
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
          ) => HandleReturnType<Received<TOutput, TPreferTransformed>, Received<TIteration, TPreferTransformed>>
        >;
  };

  function procedure(options?: KnownAny): KnownAny {
    // a Standard Schema without Standard JSON Schema, as zod before 4.2 or valibot without toStandardJsonSchema,
    // validates but has no JSON Schema to emit
    for (const slot of ['body', 'query', 'params', 'output', 'iteration'] as const) {
      const model = options?.[slot];
      if (model && !model['~standard']?.jsonSchema) {
        console.warn(
          `🐺 The ${slot} schema of a procedure has no Standard JSON Schema, so the ${slot} is emitted as {} (any value): OpenAPI, client-side validation, AI tools and the Python and Rust clients take any value there.`
        );
      }
    }
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
