import * as Yup from 'yup';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
import { convertSchema } from '@sodaru/yup-to-json-schema';

type VovkRequestWithOptionalYup<
  YUP_BODY extends Yup.Schema<KnownAny> | null = null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
> = VovkRequest<
  YUP_BODY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_BODY> : never,
  YUP_QUERY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_QUERY> : undefined
>;

type Handler<REQ, YUP_OUTPUT> = (req: REQ, params: KnownAny) => YUP_OUTPUT extends Yup.Schema<KnownAny> ? YUP_OUTPUT | Promise<Yup.InferType<YUP_OUTPUT>> : KnownAny;

function withYup<
  T extends Handler<REQ, YUP_OUTPUT>,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
  YUP_OUTPUT extends Yup.Schema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(
  bodyModel: YUP_BODY,
  queryModel: YUP_QUERY | null,
  outputModel: YUP_OUTPUT | null,
  givenHandler: T
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withYup<
  T extends Handler<REQ, YUP_OUTPUT>,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
  YUP_OUTPUT extends Yup.Schema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(bodyModel: YUP_BODY, queryModel: YUP_QUERY, givenHandler: T): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
// without output model
function withYup<
  T extends Handler<REQ, YUP_OUTPUT>,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
  YUP_OUTPUT extends Yup.Schema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(bodyModel: YUP_BODY, givenHandler: T): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withYup<
  T extends Handler<REQ, YUP_OUTPUT>,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
  YUP_OUTPUT extends Yup.Schema<KnownAny> | null = null,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(bodyModel: YUP_BODY, queryModel: YUP_QUERY | T, outputModel?: YUP_OUTPUT | T, givenHandler?: T) {
  if (typeof outputModel === 'function') {
    return withYup<T, YUP_BODY, YUP_QUERY, YUP_OUTPUT, REQ>(bodyModel, queryModel as YUP_QUERY, null, outputModel);
  }

  if (typeof queryModel === 'function') {
    return withYup<Handler<REQ, null>, YUP_BODY, YUP_QUERY, null, REQ>(bodyModel, null, null, queryModel as Handler<REQ, null>);
  }

  const outputHandler = async (req: REQ, params: Parameters<T>[1]) => {
    const output = await (givenHandler as T)(req, params);
    if (outputModel) {
      if (!output) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is empty. You probably forgot to return something from your handler.'
        );
      }
      try {
        await outputModel.validate(output);
      } catch (e) {
        const err = (e as Yup.ValidationError).errors.join(', ');
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Yup validation failed. Invalid response on server for ${req.url}. ${err}`
        );
      }
    }

    return output;
  };

  const handler = async (req: REQ, params: Parameters<T>[1]) => {
    if (bodyModel) {
      const body: unknown = await req.json();
      try {
        await bodyModel.validate(body);
      } catch (e) {
        const err = (e as Yup.ValidationError).errors.join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid request body on server for ${req.url}. ${err}`
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(body as YUP_BODY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_BODY> : never);
    }

    if (queryModel) {
      const query = req.vovk.query();

      try {
        await queryModel.validate(query);
      } catch (e) {
        const err = (e as Yup.ValidationError).errors.join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid request query on server for ${req.url}. ${err}`
        );
      }
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(handler, {
    body: bodyModel ? convertSchema(bodyModel) : undefined,
    query: queryModel ? convertSchema(queryModel) : undefined,
    output: outputModel ? convertSchema(outputModel) : undefined,
  });

  return handler as (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
}

export { withYup };
