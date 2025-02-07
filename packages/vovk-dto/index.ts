import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { setHandlerValidation, HttpException, HttpStatus, type VovkRequest, type KnownAny } from 'vovk';

type VovkRequestWithOptionalDto<BODY extends object | null = null, QUERY extends object | null = null> = VovkRequest<
  BODY extends object ? BODY : never,
  QUERY extends object ? QUERY : undefined
>;

function withDto<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  OUTPUT extends object | null = KnownAny,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(
  bodyDto: ClassConstructor<BODY> | null,
  queryDto: ClassConstructor<QUERY> | null,
  outputDto: ClassConstructor<OUTPUT> | null,
  givenHandler: T,
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withDto<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  OUTPUT extends object | null = KnownAny,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(
  bodyDto: ClassConstructor<BODY> | null,
  queryDto: ClassConstructor<QUERY> | null,
  givenHandler: T,
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withDto<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  OUTPUT extends object | null = KnownAny,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(
  bodyDto: ClassConstructor<BODY> | null,
  givenHandler: T,
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withDto<
  T extends (req: REQ, params: KnownAny) => OUTPUT,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  OUTPUT extends object | null = KnownAny,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(
  bodyDto: ClassConstructor<BODY> | null,
  queryDto: ClassConstructor<QUERY> | null | T,
  outputDto?: ClassConstructor<OUTPUT> | null | T,
  givenHandler?: T,
) {
  if(typeof outputDto === 'function') {
    return withDto<T, BODY, QUERY, OUTPUT, REQ>(bodyDto, queryDto as ClassConstructor<QUERY>, null, outputDto as T);
  }

  if(typeof queryDto === 'function') {
    return withDto<T, BODY, QUERY, OUTPUT, REQ>(bodyDto, null, null, queryDto as T);
  }

  type EnhancedReq = Omit<REQ, 'vovk'> & {
    vovk: Omit<REQ['vovk'], 'body' | 'query'> & {
      body: () => Promise<BODY extends object ? BODY : never>;
      query: () => QUERY extends object ? QUERY : never;
    };
  };

  const outputHandler = async (req: EnhancedReq, params: KnownAny): Promise<OUTPUT> => {
    const output = await givenHandler!(req as unknown as REQ, params);
    if (outputDto) {
      if (!output) {
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Output is required. You probably forgot to return something from your handler.'
        );
      }
      const outputInstance = plainToInstance(outputDto, output);
      const outputErrors: ValidationError[] = await validate(outputInstance!);

      if (outputErrors.length > 0) {
        const err = outputErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Validation failed. Invalid response on server for ${req.url}. ${err}`
        );
      }
    }

    return output;
  };

  const handler = async (req: EnhancedReq, params: Parameters<T>[1]) => {
    if (bodyDto) {
      const body: unknown = await req.json();
      const bodyInstance = plainToInstance(bodyDto, body);
      const bodyErrors: ValidationError[] = await validate(bodyInstance as object);

      if (bodyErrors.length > 0) {
        const err = bodyErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request body on server for ${req.url}. ${err}`
        );
      }
      // redeclare to add ability to call req.json() again
      req.json = () => Promise.resolve(body as BODY extends object ? BODY : never);
      req.vovk.body = () => Promise.resolve(bodyInstance as BODY extends object ? BODY : never);
    }

    if (queryDto) {
      const query = req.vovk.query();
      const queryInstance = plainToInstance(queryDto as ClassConstructor<QUERY>, query);
      const queryErrors: ValidationError[] = await validate(queryInstance as object);

      if (queryErrors.length > 0) {
        const err = queryErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join(', ');
        throw new HttpException(
          HttpStatus.BAD_REQUEST,
          `Validation failed. Invalid request query on server for ${req.url}. ${err}`
        );
      }

      req.vovk.query = () => queryInstance as QUERY extends object ? QUERY : never;
    }

    return outputHandler(req, params);
  };

  void setHandlerValidation(handler, {
    body: bodyDto ? { isDTO: true } : null,
    query: queryDto ? { isDTO: true } : null,
    output: outputDto ? { isDTO: true } : null,
  });

  return handler as (req: EnhancedReq, params: Parameters<T>[1]) => ReturnType<T>;
}

export { withDto };
