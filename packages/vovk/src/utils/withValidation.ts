import { HttpException } from '../HttpException';
import { HttpStatus, VovkHandlerSchema, type KnownAny, type VovkRequest } from '../types';
import { setHandlerSchema } from './setHandlerSchema';

export function withValidation<
  T extends (req: KnownAny, params: KnownAny) => KnownAny,
  BODY_MODEL,
  QUERY_MODEL,
  PARAMS_MODEL,
  OUTPUT_MODEL,
>({
  body,
  query,
  params,
  output,
  handle,
  getHandlerSchema,
  validate,
}: {
  body?: BODY_MODEL;
  query?: QUERY_MODEL;
  params?: PARAMS_MODEL;
  output?: OUTPUT_MODEL;
  handle: T;
  getHandlerSchema?: () => Omit<VovkHandlerSchema, 'httpMethod' | 'path'>;
  validate: (
    data: KnownAny,
    model: NonNullable<BODY_MODEL | QUERY_MODEL | PARAMS_MODEL | OUTPUT_MODEL>,
    meta: {
      type: 'body' | 'query' | 'params' | 'output';
      req: VovkRequest<KnownAny, KnownAny>;
    }
  ) => KnownAny;
}) {
  const outputHandler = async (req: VovkRequest<KnownAny, KnownAny>, handlerParams: Parameters<T>[1]) => {
    const data = await handle(req, handlerParams);
    if (output) {
      if (!data) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      await validate(data, output, { type: 'output', req });
    }

    return data;
  };

  const resultHandler = async (req: VovkRequest<KnownAny, KnownAny>, handlerParams: Parameters<T>[1]) => {
    if (body) {
      const data = await req.json();
      const instance = (await validate(data, body, { type: 'body', req })) ?? data;

      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(data);
      req.vovk.body = () => Promise.resolve(instance);
    }

    if (query) {
      const data = req.vovk.query();
      const instance = (await validate(data, query, { type: 'query', req })) ?? data;
      req.vovk.query = () => instance;
    }

    if (params) {
      const data = req.vovk.params();
      const instance = (await validate(data, params, { type: 'params', req })) ?? data;
      req.vovk.params = () => instance;
    }

    return outputHandler(req, handlerParams);
  };

  if (getHandlerSchema) {
    setHandlerSchema(resultHandler, getHandlerSchema());
  }

  return resultHandler as T;
}
