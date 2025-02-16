import * as Yup from 'yup';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';
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
}): T {
  const outputHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
    const outputData = await handle(req, handlerParams);
    if (output) {
      if (!outputData) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is empty. You probably forgot to return something from your handler.'
        );
      }
      try {
        await output.validate(outputData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Yup validation failed. Invalid response on server for ${req.url}. ${getErrorText(e)}`,
          { output: outputData }
        );
      }
    }

    return outputData;
  };

  const resultHandler = async (req: REQ, handlerParams: Parameters<T>[1]) => {
    if (body) {
      const bodyData: unknown = await req.json();

      try {
        await body.validate(bodyData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid request body on server for ${req.url}. ${getErrorText(e)}`,
          { body: bodyData }
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () =>
        Promise.resolve(bodyData as YUP_BODY extends Yup.Schema<KnownAny> ? Yup.InferType<YUP_BODY> : never);
    }

    if (query) {
      const queryData = req.vovk.query();

      try {
        await query.validate(queryData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid request query on server for ${req.url}. ${getErrorText(e)}`
        );
      }
    }

    if (params) {
      const paramsData = req.vovk.params();

      try {
        await params.validate(paramsData);
      } catch (e) {
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Yup validation failed. Invalid request params on server for ${req.url}. ${getErrorText(e)}`
        );
      }
    }

    return outputHandler(req, handlerParams);
  };

  void setHandlerValidation(resultHandler, {
    body: body ? convertSchema(body) : undefined,
    query: query ? convertSchema(query) : undefined,
    output: output ? convertSchema(output) : undefined,
    params: params ? convertSchema(params) : undefined,
  });

  return resultHandler as T;
}

export { withYup };
