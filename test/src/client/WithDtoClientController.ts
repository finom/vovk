import { post, prefix, put, del, get, openapi } from 'vovk';
import { withDto } from 'vovk-dto';
import { Contains, IsArray, IsString, ArrayNotEmpty, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import { OmitType } from 'vovk-mapped-types';

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

class BodyComplexDto {
  @Contains('hello_body')
  hello: 'hello_body';
  @Contains('world_body')
  world: 'world_body';
  @Contains('omit')
  omit: 'omit';
}

class OutputDto {
  @Contains('hello')
  hello: 'hello';
}

export class MappedDto extends OmitType(BodyComplexDto, ['omit'] as const) {}

// Sub-DTO for the nestedObj property
// e.g. arrOfObjects[1].nestedObj = { deepKey: 'deepValue' }
class NestedDeepObjDTO {
  @IsString()
  deepKey: string;
}

// Sub-DTO for each item inside z.d.arrOfObjects
class NestedArrOfObjectsItemDTO {
  @IsString()
  foo: string;

  // e.g. arrOfObjects[0].nestedArr = ['one', 'two', 'three']
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nestedArr?: string[];

  // e.g. arrOfObjects[1].nestedObj = { deepKey: 'deepValue' }
  @IsOptional()
  @ValidateNested()
  @Type(() => NestedDeepObjDTO)
  nestedObj?: NestedDeepObjDTO;
}

// Sub-DTO for z.d, which contains the field x and arrOfObjects
class NestedDDTO {
  @IsString()
  x: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NestedArrOfObjectsItemDTO)
  arrOfObjects: NestedArrOfObjectsItemDTO[];
}

// Sub-DTO for z, containing f, u, d
class NestedZDTO {
  @IsString()
  f: string;

  @IsArray()
  @IsString({ each: true })
  u: string[];

  @ValidateNested()
  @Type(() => NestedDDTO)
  d: NestedDDTO;
}

// The top-level DTO for your example object
export class NestedExampleObjectDTO {
  @IsString()
  x: string;

  @IsArray()
  @IsString({ each: true })
  y: string[];

  @ValidateNested()
  @Type(() => NestedZDTO)
  z: NestedZDTO;
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

  @put.auto()
  static putWithMappedType = withDto(MappedDto, async (req) => {
    const body = await req.vovk.body();
    return { body };
  });

  @get('nested-query')
  static getNestedQuery = withDto(null, NestedExampleObjectDTO, (req) => {
    return { query: req.vovk.query(), search: decodeURIComponent(req.nextUrl.search) };
  });

  @openapi({
    summary: 'This is a summary',
  })
  @get('output-and-openapi')
  static outputWithOpenApi = withDto(null, OutputDto, OutputDto, (req) => {
    return { hello: req.vovk.query().hello };
  });
}
