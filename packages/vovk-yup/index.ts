import * as Yup from 'yup';
import { withValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import { convertSchema } from '@sodaru/yup-to-json-schema';

const getErrorText = (e: unknown) => (e as Yup.ValidationError)?.errors.join(', ') ?? String(e);

function withYup<
  T extends (req: REQ, params: YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>) => KnownAny,
  YUP_BODY extends Yup.Schema<KnownAny>,
  YUP_QUERY extends Yup.Schema<KnownAny>,
  YUP_OUTPUT extends Yup.Schema<KnownAny>,
  YUP_PARAMS extends Yup.Schema<KnownAny>,
  REQ extends VovkRequest<
    YUP_BODY extends Yup.Schema<infer U> ? U : never,
    YUP_QUERY extends Yup.Schema<infer U> ? U : undefined,
    YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>
  > = VovkRequest<
    YUP_BODY extends Yup.Schema<infer U> ? U : never,
    YUP_QUERY extends Yup.Schema<infer U> ? U : undefined,
    YUP_PARAMS extends Yup.Schema<infer U> ? U : Record<string, string>
  >,
>({
  body,
  query,
  params,
  output,
  handle,
}: {
  body?: YUP_BODY;
  query?: YUP_QUERY;
  params?: YUP_PARAMS;
  output?: YUP_OUTPUT;
  handle: T;
}) {
  return withValidation({
    body,
    query,
    params,
    output,
    handle: handle as T & { __output: YUP_OUTPUT extends Yup.Schema<infer U> ? U : KnownAny },
    getHandlerSchema: () => {
      const getMethodSchema = (model?: Yup.Schema<KnownAny>) => (model ? convertSchema(model) : null);

      return {
        validation: {
          body: getMethodSchema(body),
          query: getMethodSchema(query),
          output: getMethodSchema(output),
          params: getMethodSchema(params),
        },
      };
    },
    validate: async (data, model, { type, req }) => {
      try {
        await model.validate(data);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid ${type} on server for ${req.url}. ${getErrorText(e)}`,
          { [type]: data }
        );
      }
    },
  });
}

export { withYup };
