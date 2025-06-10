import type { StandardSchemaV1 } from '@standard-schema/spec';
import { HttpStatus, KnownAny, VovkRequest, VovkTypedMethod, VovkValidationType } from '../types';
import { withValidationLibrary } from './withValidationLibrary';
import { HttpException } from '../HttpException';

export function withStandard<
  T extends (
    req: REQ,
    params: PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<PARAMS> : Record<string, string>
  ) => KnownAny,
  BODY extends StandardSchemaV1 | undefined = undefined,
  QUERY extends StandardSchemaV1 | undefined = undefined,
  OUTPUT extends StandardSchemaV1 | undefined = undefined,
  PARAMS extends StandardSchemaV1 | undefined = undefined,
  ITERATION extends StandardSchemaV1 | undefined = undefined,
  REQ extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
    BODY extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<BODY> : undefined,
    QUERY extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<QUERY> : undefined,
    PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<PARAMS> : undefined
  >,
>({
  body,
  query,
  params,
  output,
  iteration,
  handle,
  toJSONSchema,
  disableServerSideValidation,
  skipSchemaEmission,
  validateEachIteration,
}: {
  body?: BODY;
  query?: QUERY;
  params?: PARAMS;
  output?: OUTPUT;
  iteration?: ITERATION;
  handle: T;
  disableServerSideValidation?: boolean | VovkValidationType[];
  skipSchemaEmission?: boolean | VovkValidationType[];
  validateEachIteration?: boolean;
  toJSONSchema: (
    model: NonNullable<BODY | QUERY | PARAMS | OUTPUT | ITERATION>,
    meta: { type: VovkValidationType }
  ) => KnownAny;
}) {
  return withValidationLibrary({
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
      PARAMS extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<PARAMS> : Record<string, string>,
      OUTPUT extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<OUTPUT> : KnownAny,
      ITERATION extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<ITERATION> : KnownAny
    >,
    toJSONSchema,
    validate: async (data, model, { type, i }) => {
      const { issues } = await model['~standard'].validate(data);
      if (issues?.length) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid ${type === 'iteration' ? `${type} #${i}` : type} on server: ${issues
            .map(({ message, path }) => `${message}${path ? ` at ${path.join('.')}` : ''}`)
            .join(', ')}`,
          { [type]: data, error: issues }
        );
      }
    },
  });
}
