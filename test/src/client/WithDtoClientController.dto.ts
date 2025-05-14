import {
  IsNumber,
  Min,
  Max,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsUrl,
  IsUUID,
  IsISO8601,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  ValidateNested,
  IsOptional,
  IsDefined,
  IsObject,
  IsIn,
  IsArray,
} from 'class-validator';
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
  @MaxLength(5)
  @IsString()
  x: string;

  @IsArray()
  @IsString({ each: true })
  y: string[];

  // @ValidateNested() // TODO: WARNING: Ndsted validation suddenly stopped working
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

export class RequiredObject {
  @IsDefined()
  @IsString()
  requiredField: string;

  @IsOptional()
  @IsNumber()
  optionalField?: number;
}

export class StrictObject {
  @IsString()
  knownField: string;
}

class AllOfDtoA {
  @IsString()
  a: string;
}
class AllOfDtoB {
  @IsNumber()
  b: number;
}

export class ConstrainingDto {
  @IsIn(['a', 'b', 'c'])
  enum_value: 'a' | 'b' | 'c';

  // Number validations
  @IsNumber()
  @Min(1)
  num_minimum: number;

  @IsNumber()
  @Max(100)
  num_maximum: number;

  @IsNumber()
  num_exclusiveMinimum: number; // WARNING: Can't impelemt gt(1) with standard decorators

  @IsNumber()
  num_exclusiveMaximum: number; // WARNING: Can't impelemt lt(100) with standard decorators

  @IsNumber()
  num_multipleOf: number; // WARNING: Can't impelemt multipleOf with standard decorators

  @IsInt()
  num_int: number;

  @IsInt()
  @Max(2147483647)
  @Min(-2147483648)
  num_int32: number;

  // String validations
  @IsString()
  @MinLength(3)
  str_minLength: string;

  @IsString()
  @MaxLength(50)
  str_maxLength: string;

  @IsString()
  @Matches(/^[A-Z][a-z]*$/)
  str_pattern: string;

  @IsEmail()
  str_email: string;

  @IsUrl()
  str_url: string;

  @IsUUID()
  str_uuid: string;

  @IsISO8601()
  str_datetime: string; // WARNING: Client validation is ignored in Python

  // Array validations
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  arr_minItems: string[];

  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  arr_maxItems: string[];

  // Object validations
  // @ValidateNested() // TODO: WARNING: Ndsted validation suddenly stopped working
  @Type(() => RequiredObject)
  obj_required: RequiredObject;

  // @ValidateNested() // TODO: WARNING: Ndsted validation suddenly stopped working
  @Type(() => StrictObject)
  obj_strict: StrictObject; // Cannot enforce "strict" (no additional properties) with standard decorators

  // This can be string OR number OR boolean, but there's no standard way to represent unions
  logical_anyOf: string | number | boolean;
  // We can't represent an intersection directly
  @IsObject()
  logical_allOf: AllOfDtoA & AllOfDtoB;
}
