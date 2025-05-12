import { __decorate, __metadata } from "tslib";
import { IsNumber, Min, Max, IsInt, MinLength, MaxLength, Matches, IsEmail, IsUrl, IsUUID, IsISO8601, ArrayMinSize, ArrayMaxSize, IsString, ValidateNested, IsOptional, IsDefined, IsObject, IsIn, IsArray, } from 'class-validator';
import { Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
export class HandleAllBodyDto {
    hello;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleAllBodyDto.prototype, "hello", void 0);
export class HandleAllQueryDto {
    search;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleAllQueryDto.prototype, "search", void 0);
export class HandleAllParamsDto {
    foo;
    bar;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleAllParamsDto.prototype, "foo", void 0);
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleAllParamsDto.prototype, "bar", void 0);
export class HandleAllOutputDto {
    body;
    query;
    params;
    vovkParams;
}
__decorate([
    ValidateNested(),
    Type(() => HandleAllBodyDto),
    __metadata("design:type", HandleAllBodyDto)
], HandleAllOutputDto.prototype, "body", void 0);
__decorate([
    ValidateNested(),
    Type(() => HandleAllQueryDto),
    __metadata("design:type", HandleAllQueryDto)
], HandleAllOutputDto.prototype, "query", void 0);
__decorate([
    ValidateNested(),
    Type(() => HandleAllParamsDto),
    __metadata("design:type", HandleAllParamsDto)
], HandleAllOutputDto.prototype, "params", void 0);
__decorate([
    ValidateNested(),
    Type(() => HandleAllParamsDto),
    __metadata("design:type", HandleAllParamsDto)
], HandleAllOutputDto.prototype, "vovkParams", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleQuery
 * -------------------------------------------------------------------------
 */
export class HandleQueryQueryDto {
    search;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleQueryQueryDto.prototype, "search", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
export class HandleBodyBodyDto {
    hello;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleBodyBodyDto.prototype, "hello", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
export class HandleParamsDto {
    foo;
    bar;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleParamsDto.prototype, "foo", void 0);
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleParamsDto.prototype, "bar", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleNestedQuery
 * -------------------------------------------------------------------------
 */
export class NestedObjDto {
    deepKey;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], NestedObjDto.prototype, "deepKey", void 0);
export class ArrOfObjectsDto {
    foo;
    nestedArr;
    nestedObj;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ArrOfObjectsDto.prototype, "foo", void 0);
__decorate([
    IsOptional(),
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], ArrOfObjectsDto.prototype, "nestedArr", void 0);
__decorate([
    IsOptional(),
    ValidateNested(),
    Type(() => NestedObjDto),
    __metadata("design:type", NestedObjDto)
], ArrOfObjectsDto.prototype, "nestedObj", void 0);
export class DDto {
    x;
    // @Type(() => ArrOfObjectsDto)
    arrOfObjects;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], DDto.prototype, "x", void 0);
__decorate([
    IsArray(),
    ValidateNested({ each: true }),
    JSONSchema({
        items: {
            $ref: '#/definitions/ArrOfObjectsDto',
        },
    })
    // @Type(() => ArrOfObjectsDto)
    ,
    __metadata("design:type", Array)
], DDto.prototype, "arrOfObjects", void 0);
export class ZDto {
    f;
    u;
    d;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], ZDto.prototype, "f", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], ZDto.prototype, "u", void 0);
__decorate([
    ValidateNested(),
    Type(() => DDto),
    __metadata("design:type", DDto)
], ZDto.prototype, "d", void 0);
export class HandleNestedQueryDto {
    x;
    y;
    z;
}
__decorate([
    MaxLength(5),
    IsString(),
    __metadata("design:type", String)
], HandleNestedQueryDto.prototype, "x", void 0);
__decorate([
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], HandleNestedQueryDto.prototype, "y", void 0);
__decorate([
    ValidateNested(),
    Type(() => ZDto),
    __metadata("design:type", ZDto)
], HandleNestedQueryDto.prototype, "z", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleOutput
 * -------------------------------------------------------------------------
 */
export class HandleOutputQueryDto {
    helloOutput;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], HandleOutputQueryDto.prototype, "helloOutput", void 0);
export class HandleOutputOutputDto {
    hello;
}
__decorate([
    IsString(),
    MaxLength(5),
    __metadata("design:type", String)
], HandleOutputOutputDto.prototype, "hello", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleStream
 * -------------------------------------------------------------------------
 */
export class HandleStreamQueryDto {
    values;
}
__decorate([
    IsArray(),
    IsString({ each: true }),
    __metadata("design:type", Array)
], HandleStreamQueryDto.prototype, "values", void 0);
/**
 * -------------------------------------------------------------------------
 * DTOs for handleStream with iteration
 * -------------------------------------------------------------------------
 * */
export class IterationDto {
    value;
}
__decorate([
    IsIn(['a', 'b', 'c', 'd']),
    __metadata("design:type", String)
], IterationDto.prototype, "value", void 0);
/**
 * -------------------------------------------------------------------------
 *  DTOs for values with a, b, c, d
 * -------------------------------------------------------------------------
 */
export class QueryValuesDto {
    values;
}
__decorate([
    IsArray(),
    __metadata("design:type", Array)
], QueryValuesDto.prototype, "values", void 0);
export class RequiredObject {
    requiredField;
    optionalField;
}
__decorate([
    IsDefined(),
    IsString(),
    __metadata("design:type", String)
], RequiredObject.prototype, "requiredField", void 0);
__decorate([
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], RequiredObject.prototype, "optionalField", void 0);
export class StrictObject {
    knownField;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], StrictObject.prototype, "knownField", void 0);
class AllOfDtoA {
    a;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], AllOfDtoA.prototype, "a", void 0);
class AllOfDtoB {
    b;
}
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], AllOfDtoB.prototype, "b", void 0);
export class ComplainingDto {
    enum_value;
    // Number validations
    num_minimum;
    num_maximum;
    num_exclusiveMinimum; // WARNING: Can't impelemt gt(1) with standard decorators
    num_exclusiveMaximum; // WARNING: Can't impelemt lt(100) with standard decorators
    num_multipleOf; // WARNING: Can't impelemt multipleOf with standard decorators
    num_int;
    num_int32;
    // String validations
    str_minLength;
    str_maxLength;
    str_pattern;
    str_email;
    str_url;
    str_uuid;
    str_datetime; // WARNING: Client validation is ignored in Python
    // Array validations
    arr_minItems;
    arr_maxItems;
    // Object validations
    obj_required;
    obj_strict; // Cannot enforce "strict" (no additional properties) with standard decorators
    // This can be string OR number OR boolean, but there's no standard way to represent unions
    logical_anyOf;
    // We can't represent an intersection directly
    logical_allOf;
}
__decorate([
    IsIn(['a', 'b', 'c']),
    __metadata("design:type", String)
], ComplainingDto.prototype, "enum_value", void 0);
__decorate([
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_minimum", void 0);
__decorate([
    IsNumber(),
    Max(100),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_maximum", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_exclusiveMinimum", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_exclusiveMaximum", void 0);
__decorate([
    IsNumber(),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_multipleOf", void 0);
__decorate([
    IsInt(),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_int", void 0);
__decorate([
    IsInt(),
    Max(2147483647),
    Min(-2147483648),
    __metadata("design:type", Number)
], ComplainingDto.prototype, "num_int32", void 0);
__decorate([
    IsString(),
    MinLength(3),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_minLength", void 0);
__decorate([
    IsString(),
    MaxLength(50),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_maxLength", void 0);
__decorate([
    IsString(),
    Matches(/^[A-Z][a-z]*$/),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_pattern", void 0);
__decorate([
    IsEmail(),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_email", void 0);
__decorate([
    IsUrl(),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_url", void 0);
__decorate([
    IsUUID(),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_uuid", void 0);
__decorate([
    IsISO8601(),
    __metadata("design:type", String)
], ComplainingDto.prototype, "str_datetime", void 0);
__decorate([
    ArrayMinSize(1),
    ArrayMaxSize(10),
    IsString({ each: true }),
    __metadata("design:type", Array)
], ComplainingDto.prototype, "arr_minItems", void 0);
__decorate([
    ArrayMinSize(1),
    ArrayMaxSize(10),
    IsString({ each: true }),
    __metadata("design:type", Array)
], ComplainingDto.prototype, "arr_maxItems", void 0);
__decorate([
    ValidateNested(),
    Type(() => RequiredObject),
    __metadata("design:type", RequiredObject)
], ComplainingDto.prototype, "obj_required", void 0);
__decorate([
    ValidateNested(),
    Type(() => StrictObject),
    __metadata("design:type", StrictObject)
], ComplainingDto.prototype, "obj_strict", void 0);
__decorate([
    IsObject(),
    __metadata("design:type", Object)
], ComplainingDto.prototype, "logical_allOf", void 0);
//# sourceMappingURL=WithDtoClientController.dto.js.map