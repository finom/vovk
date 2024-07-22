import { post, prefix, put, del, get } from 'vovk';
import withDto from 'vovk-dto';
import { Contains } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export class BodyDto {
  @Contains('body')
  hello: 'body';
}

export class QueryDto {
  @Contains('query')
  hey: 'query';
}

export class ReturnDto {
  @Contains('body')
  hello: 'body';
  @Contains('query')
  hey: 'query';
}

@prefix('with-dto')
export default class WithDtoClientController {
  @post.auto()
  static postWithBodyAndQuery = withDto(BodyDto, QueryDto, async (req) => {
    const body = await req.json();
    const hey = req.nextUrl.searchParams.get('hey');
    return { body, query: { hey } };
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
}
