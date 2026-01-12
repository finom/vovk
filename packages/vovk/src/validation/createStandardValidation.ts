import type { CombinedSpec } from './types.js';
import {
  HttpStatus,
  type VovkRequest,
  type VovkTypedMethod,
  type VovkValidationType,
  type VovkOperationObject,
} from '../types.js';
import { withValidationLibrary } from './withValidationLibrary.js';
import { HttpException } from '../core/HttpException.js';
import { createToolFactory } from '../tools/createToolFactory.js';

type KnownAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export function createStandardValidation({
  toJSONSchema,
}: {
  toJSONSchema: (
    model: KnownAny,
    meta: { validationType: VovkValidationType; target: CombinedSpec.Target | undefined }
  ) => KnownAny;
}) {
  function withStandard<
    T extends (
      req: TReq,
      params: TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : Record<string, string>
    ) => KnownAny,
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
    target?: CombinedSpec.Target;
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
        TBody extends CombinedSpec ? CombinedSpec.InferOutput<TBody> : KnownAny,
        TQuery extends CombinedSpec ? CombinedSpec.InferOutput<TQuery> : KnownAny,
        TParams extends CombinedSpec ? CombinedSpec.InferOutput<TParams> : KnownAny,
        TOutput extends CombinedSpec ? CombinedSpec.InferOutput<TOutput> : KnownAny,
        TIteration extends CombinedSpec ? CombinedSpec.InferOutput<TIteration> : KnownAny,
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

        return (result as CombinedSpec.SuccessResult<typeof model>).value;
      },
      preferTransformed,
      operationObject,
    });
  }

  return Object.assign(withStandard, { createTool: createToolFactory({ toJSONSchema }) });
}
