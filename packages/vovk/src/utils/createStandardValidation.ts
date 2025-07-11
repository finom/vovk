import type { StandardSchemaV1 } from '@standard-schema/spec';
import { HttpStatus, KnownAny, VovkRequest, VovkTypedMethod, VovkValidationType } from '../types';
import { withValidationLibrary } from './withValidationLibrary';
import { HttpException } from '../HttpException';

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { type: VovkValidationType }
  ) => KnownAny;
}) {
  function withStandard<
    T extends (
      req: REQ,
      params: PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferInput<PARAMS> : Record<string, string>
    ) => KnownAny,
    BODY extends StandardSchemaV1,
    QUERY extends StandardSchemaV1,
    PARAMS extends StandardSchemaV1,
    OUTPUT extends StandardSchemaV1,
    ITERATION extends StandardSchemaV1,
    REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
      BODY extends StandardSchemaV1 ? StandardSchemaV1.InferInput<BODY> : undefined,
      QUERY extends StandardSchemaV1 ? StandardSchemaV1.InferInput<QUERY> : undefined,
      PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferInput<PARAMS> : undefined
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
  }: {
    isForm?: IS_FORM;
    body?: BODY;
    query?: QUERY;
    params?: PARAMS;
    output?: OUTPUT;
    iteration?: ITERATION;
    handle: T;
    disableServerSideValidation?: boolean | VovkValidationType[];
    skipSchemaEmission?: boolean | VovkValidationType[];
    validateEachIteration?: boolean;
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
        BODY extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<BODY> : KnownAny,
        QUERY extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<QUERY> : KnownAny,
        PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<PARAMS> : KnownAny,
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
    });
  }

  return withStandard;
}
