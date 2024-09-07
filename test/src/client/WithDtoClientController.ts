import { post, prefix, put, del, get } from 'vovk';
import { withDto } from 'vovk-dto';
import { Contains, IsArray, IsString, ArrayNotEmpty, ArrayMinSize } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class BodyDto {
  @Contains('body')
  hello: 'body';
}

export class QueryDto {
  @Contains('query')
  hey: 'query';
}

export class QueryWithArrayDto {
  @Contains('query')
  hey: 'query';
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  array1: 'foo'[];

  @ArrayMinSize(2)
  @IsArray()
  @IsString({ each: true })
  array2: ('bar' | 'baz')[];
}

export class ReturnDto {
  @Contains('body')
  hello: 'body';
  @Contains('query')
  hey: 'query';
}

@prefix('with-dto')
export default class WithDtoClientController {
  @post('with-params/:param')
  static postWithBodyQueryAndParams = withDto(BodyDto, QueryDto, async (req, params: { param: 'foo' }) => {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey }, params };
  });

  @post.auto()
  static postWithBodyAndQueryTransformed = withDto(BodyDto, QueryDto, async (req) => {
    const { hello } = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return plainToInstance(ReturnDto, { hello, hey });
  });

  @put.auto()
  static putWithBodyAndNullQuery = withDto(BodyDto, null, async (req) => {
    const body = await req.json();
    return { body };
  });

  @del.auto()
  static putWithBodyOnly = withDto(BodyDto, async (req) => {
    const body = await req.json();
    return { body };
  });

  @get.auto()
  static getWithQueryAndNullBody = withDto(null, QueryDto, (req) => {
    const hey = req.nextUrl.searchParams.get('hey');
    return { query: { hey } };
  });

  @post.auto()
  static postWithBodyAndQueryWithReqVovk = withDto(BodyDto, QueryDto, async (req) => {
    const body = await req.vovk.body();
    const query = req.vovk.query();
    const bodyInstanceOfDto = body instanceof BodyDto;
    const queryInstanceOfDto = query instanceof QueryDto;
    return { body, query, bodyInstanceOfDto, queryInstanceOfDto };
  });

  @get.auto()
  static getWithQueryArrayAndNullBody = withDto(null, QueryWithArrayDto, (req) => {
    return { query: req.vovk.query() };
  });
}
