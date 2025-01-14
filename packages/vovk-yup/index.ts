import * as Yup from 'yup';
import { HttpException, HttpStatus, type VovkRequest } from 'vovk';
import setClientValidatorsForHandler from 'vovk/utils/setClientValidatorsForHandler';
import { convertSchema } from '@sodaru/yup-to-json-schema';
import reqQuery from 'vovk/utils/reqQuery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KnownAny = any;

type VovkRequestWithOptionalYup<
  YUP_BODY extends Yup.Schema<KnownAny> | null = null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = null,
> = VovkRequest<
  YUP_BODY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_BODY> : never,
  YUP_QUERY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_QUERY> : undefined
>;

function withYup<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = Yup.Schema<undefined>,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(
  bodyModel: YUP_BODY,
  queryModel: YUP_QUERY | null,
  givenHandler: T
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withYup<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = Yup.Schema<undefined>,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(bodyModel: YUP_BODY, givenHandler: T): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withYup<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  YUP_BODY extends Yup.Schema<KnownAny> | null,
  YUP_QUERY extends Yup.Schema<KnownAny> | null = Yup.Schema<undefined>,
  REQ extends VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY> = VovkRequestWithOptionalYup<YUP_BODY, YUP_QUERY>,
>(bodyModel: YUP_BODY, queryModel: YUP_QUERY | null | T, givenHandler?: T) {
  if (typeof queryModel === 'function') {
    return withYup<T, YUP_BODY, YUP_QUERY, REQ>(bodyModel, null, queryModel);
  }

  const h = async (req: REQ, params: Parameters<T>[1]) => {
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
      const query = reqQuery(req);

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

    return givenHandler!(req, params);
  };

  void setClientValidatorsForHandler(h, {
    body: bodyModel ? convertSchema(bodyModel) : undefined,
    query: queryModel ? convertSchema(queryModel) : undefined,
  });

  return h as (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
}

export { withYup };
