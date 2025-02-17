import { IsString, Equals, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
export class HandleAllBodyDto {
  @IsString()
  @Equals('world')
  hello: string;
}

export class HandleAllQueryDto {
  @IsString()
  @Equals('value')
  search: string;
}

export class HandleAllParamsDto {
  @IsString()
  @Equals('foo')
  foo: string;

  @IsString()
  @Equals('bar')
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
  @Equals('value')
  search: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
export class HandleBodyBodyDto {
  @IsString()
  @Equals('world')
  hello: string;
}

/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
export class HandleParamsDto {
  @IsString()
  @Equals('foo')
  foo: string;

  @IsString()
  @Equals('bar')
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
  @Type(() => ArrOfObjectsDto)
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
  @Equals('world')
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
 *  Service class
 * -------------------------------------------------------------------------
 */
