import { validate, type ValidationError } from 'class-validator';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { setClientValidatorsForHandler, HttpException, HttpStatus, type VovkRequest } from 'vovk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KnownAny = any;

type VovkRequestWithOptionalDto<BODY extends object | null = null, QUERY extends object | null = null> = VovkRequest<
  BODY extends object ? BODY : never,
  QUERY extends object ? QUERY : undefined
>;

function withDto<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(
  bodyDto: ClassConstructor<BODY> | null,
  queryDto: ClassConstructor<QUERY> | null,
  givenHandler: T
): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withDto<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(bodyDto: ClassConstructor<BODY> | null, givenHandler: T): (req: REQ, params: Parameters<T>[1]) => ReturnType<T>;
function withDto<
  T extends (req: REQ, params: KnownAny) => KnownAny,
  BODY extends object | null = null,
  QUERY extends object | null = null,
  REQ extends VovkRequestWithOptionalDto<BODY, QUERY> = VovkRequestWithOptionalDto<BODY, QUERY>,
>(bodyDto: ClassConstructor<BODY> | null, queryDto: ClassConstructor<QUERY> | null | T, givenHandler?: T) {
  if (typeof givenHandler === 'undefined' && typeof queryDto === 'function') {
    return withDto<T, BODY, QUERY, REQ>(bodyDto, null, queryDto as T);
  }

  type EnhancedReq = Omit<REQ, 'vovk'> & {
    vovk: Omit<REQ['vovk'], 'body' | 'query'> & {
      body: () => Promise<BODY extends object ? BODY : never>;
      query: () => QUERY extends object ? QUERY : never;
    };
  };

  const h = async (req: EnhancedReq, params: Parameters<T>[1]) => {
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
      // @ts-ignore TODO: Suppress build error in ESM mode: Property 'json' does not exist on type 'EnhancedReq'.
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

    return givenHandler!(req as unknown as REQ, params) as unknown;
  };

  void setClientValidatorsForHandler(h, {
    body: bodyDto ? { isDTO: true } : null,
    query: queryDto ? { isDTO: true } : null,
  });

  return h as (req: EnhancedReq, params: Parameters<T>[1]) => ReturnType<T>;
}

export { withDto };
