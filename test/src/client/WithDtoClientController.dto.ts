import { IsString, IsArray, IsOptional, ValidateNested, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
export class HandleAllBodyDto {
  @IsString()
  @MaxLength(5)
  hello: string;
}

export class HandleAllQueryDto {
  @IsString()
  @MaxLength(5)
  search: string;
}

export class HandleAllParamsDto {
  @IsString()
  @MaxLength(5)
  foo: string;

  @IsString()
  @MaxLength(5)
  bar: string;
}

export class HandleAllOutputDto {
  @ValidateNested()
  @Type(() => HandleAllBodyDto)
  body: HandleAllBodyDto;

  @ValidateNested()
  @Type(() => HandleAllQueryDto)
  query: HandleAllQueryDto;

  @ValidateNested()
  @Type(() => HandleAllParamsDto)
  params: HandleAllParamsDto;

  @ValidateNested()
  @Type(() => HandleAllParamsDto)
  vovkParams: HandleAllParamsDto;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleQuery
 * -------------------------------------------------------------------------
 */
export class HandleQueryQueryDto {
  @IsString()
  @MaxLength(5)
  search: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
export class HandleBodyBodyDto {
  @IsString()
  @MaxLength(5)
  hello: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
export class HandleParamsDto {
  @IsString()
  @MaxLength(5)
  foo: string;

  @IsString()
  @MaxLength(5)
  bar: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleNestedQuery
 * -------------------------------------------------------------------------
 */
export class NestedObjDto {
  @IsString()
  deepKey: string;
}

export class ArrOfObjectsDto {
  @IsString()
  foo: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nestedArr?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => NestedObjDto)
  nestedObj?: NestedObjDto;
}

export class DDto {
  @IsString()
  x: string;

  @IsArray()
  @ValidateNested({ each: true })
  @JSONSchema({
    items: {
      $ref: '#/definitions/ArrOfObjectsDto',
    },
  })
  // @Type(() => ArrOfObjectsDto)
  arrOfObjects: ArrOfObjectsDto[];
}

export class ZDto {
  @IsString()
  f: string;

  @IsArray()
  @IsString({ each: true })
  u: string[];

  @ValidateNested()
  @Type(() => DDto)
  d: DDto;
}

export class HandleNestedQueryDto {
  @MaxLength(5)
  @IsString()
  x: string;

  @IsArray()
  @IsString({ each: true })
  y: string[];

  @ValidateNested()
  @Type(() => ZDto)
  z: ZDto;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleOutput
 * -------------------------------------------------------------------------
 */
export class HandleOutputQueryDto {
  @IsString()
  helloOutput: string;
}

export class HandleOutputOutputDto {
  @IsString()
  @MaxLength(5)
  hello: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleStream
 * -------------------------------------------------------------------------
 */
export class HandleStreamQueryDto {
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

/**
 * -------------------------------------------------------------------------
 * DTOs for handleStream with iteration
 * -------------------------------------------------------------------------
 * */

export class IterationDto {
  @IsIn(['a', 'b', 'c', 'd'])
  value: 'a' | 'b' | 'c' | 'd';
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for values with a, b, c, d
 * -------------------------------------------------------------------------
 */
export class QueryValuesDto {
  @IsArray()
  values: string[];
}
