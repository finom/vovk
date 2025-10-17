import type { StandardSchemaV1 } from '@standard-schema/spec';
import {
  HttpStatus,
  type KnownAny,
  type VovkRequest,
  type VovkTypedMethod,
  type VovkValidationType,
  type VovkOperationObject,
} from '../types';
import { withValidationLibrary } from './withValidationLibrary';
import { HttpException } from '../HttpException';

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (model: KnownAny, meta: { type: VovkValidationType }) => KnownAny;
}) {
  function withStandard<
    T extends (
      req: REQ,
      params: TParams extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TParams> : Record<string, string>
    ) => KnownAny,
    TBody extends StandardSchemaV1,
    TQuery extends StandardSchemaV1,
    TParams extends StandardSchemaV1,
    OUTPUT extends StandardSchemaV1,
    ITERATION extends StandardSchemaV1,
    REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
      TBody extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TBody> : undefined,
      TQuery extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TQuery> : undefined,
      TParams extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TParams> : undefined
    >,
    IS_FORM extends boolean = false,
  >({
    isForm,
    body,
    query,
    params,
    output,
    iteration,
    handle,
    disableServerSideValidation,
    skipSchemaEmission,
    validateEachIteration,
    preferTransformed,
    operationObject,
  }: {
    isForm?: IS_FORM;
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    output?: OUTPUT;
    iteration?: ITERATION;
    handle: T;
    disableServerSideValidation?: boolean | VovkValidationType[];
    skipSchemaEmission?: boolean | VovkValidationType[];
    validateEachIteration?: boolean;
    preferTransformed?: boolean;
    operationObject?: VovkOperationObject;
  }) {
    return withValidationLibrary({
      isForm,
      body,
      query,
      params,
      output,
      iteration,
      disableServerSideValidation,
      skipSchemaEmission,
      validateEachIteration,
      handle: handle as VovkTypedMethod<
        T,
        TBody extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TBody> : KnownAny,
        TQuery extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TQuery> : KnownAny,
        TParams extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TParams> : KnownAny,
        OUTPUT extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<OUTPUT> : KnownAny,
        ITERATION extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<ITERATION> : KnownAny,
        IS_FORM
      >,
      toJSONSchema,
      validate: async (data, model, { type, i }) => {
        const result = await model['~standard'].validate(data);
        if (result.issues?.length) {
          throw new HttpException(
            HttpStatus.BAD_REQUEST,
            `Validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server: ${result.issues
              .map(({ message, path }) => `${message}${path ? ` at ${path.join('.')}` : ''}`)
              .join(', ')}`,
            { [type]: data, result }
          );
        }

        return (result as StandardSchemaV1.SuccessResult<typeof model>).value;
      },
      preferTransformed,
      operationObject,
    });
  }

  return withStandard;
}
