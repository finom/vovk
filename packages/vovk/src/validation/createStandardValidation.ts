import type { StandardSchemaV1, StandardJSONSchemaV1 } from '@standard-schema/spec';
import {
  HttpStatus,
  type VovkRequest,
  type VovkTypedMethod,
  type VovkValidationType,
  type VovkOperationObject,
} from '../types';
import { withValidationLibrary } from './withValidationLibrary';
import { HttpException } from '../core/HttpException';
import { createToolFactory } from '../tools/createToolFactory';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { validationType: VovkValidationType; target: StandardJSONSchemaV1.Target | undefined }
  ) => KnownAny;
}) {
  function withStandard<
    T extends (
      req: TReq,
      params: TParams extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TParams> : Record<string, string>
    ) => KnownAny,
    TBody extends StandardSchemaV1,
    TQuery extends StandardSchemaV1,
    TParams extends StandardSchemaV1,
    TOutput extends StandardSchemaV1,
    TIteration extends StandardSchemaV1,
    TReq extends VovkRequest<KnownAny, KnownAny, KnownAny> = VovkRequest<
      TBody extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TBody> : undefined,
      TQuery extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TQuery> : undefined,
      TParams extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TParams> : undefined
    >,
    TIsForm extends boolean = false,
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
    target,
  }: {
    isForm?: TIsForm;
    body?: TBody;
    query?: TQuery;
    params?: TParams;
    output?: TOutput;
    iteration?: TIteration;
    handle: T;
    disableServerSideValidation?: boolean | VovkValidationType[];
    skipSchemaEmission?: boolean | VovkValidationType[];
    validateEachIteration?: boolean;
    preferTransformed?: boolean;
    operationObject?: VovkOperationObject;
    target?: StandardJSONSchemaV1.Target;
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
        TOutput extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TOutput> : KnownAny,
        TIteration extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TIteration> : KnownAny,
        TIsForm
      >,
      toJSONSchema: (model, options) => toJSONSchema(model, { validationType: options.validationType, target }),
      validate: async (data, model, { validationType, i }) => {
        const result = await model['~standard'].validate(data);
        if (result.issues?.length) {
          throw new HttpException(
            HttpStatus.BAD_REQUEST,
            `Validation failed. Invalid ${validationType === 'iteration' ? `${validationType} #${i}` : validationType} on server: ${result.issues
              .map(({ message, path }) => `${message}${path ? ` at ${path.join('.')}` : ''}`)
              .join(', ')}`,
            { issues: result.issues }
          );
        }

        return (result as StandardSchemaV1.SuccessResult<typeof model>).value;
      },
      preferTransformed,
      operationObject,
    });
  }

  return Object.assign(withStandard, { createTool: createToolFactory({ toJSONSchema }) });
}
