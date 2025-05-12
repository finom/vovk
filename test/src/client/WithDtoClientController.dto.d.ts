/**
 * -------------------------------------------------------------------------
 *  DTOs for handleAll
 * -------------------------------------------------------------------------
 */
export declare class HandleAllBodyDto {
    hello: string;
}
export declare class HandleAllQueryDto {
    search: string;
}
export declare class HandleAllParamsDto {
    foo: string;
    bar: string;
}
export declare class HandleAllOutputDto {
    body: HandleAllBodyDto;
    query: HandleAllQueryDto;
    params: HandleAllParamsDto;
    vovkParams: HandleAllParamsDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleQuery
 * -------------------------------------------------------------------------
 */
export declare class HandleQueryQueryDto {
    search: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleBody
 * -------------------------------------------------------------------------
 */
export declare class HandleBodyBodyDto {
    hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleParams
 * -------------------------------------------------------------------------
 */
export declare class HandleParamsDto {
    foo: string;
    bar: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleNestedQuery
 * -------------------------------------------------------------------------
 */
export declare class NestedObjDto {
    deepKey: string;
}
export declare class ArrOfObjectsDto {
    foo: string;
    nestedArr?: string[];
    nestedObj?: NestedObjDto;
}
export declare class DDto {
    x: string;
    arrOfObjects: ArrOfObjectsDto[];
}
export declare class ZDto {
    f: string;
    u: string[];
    d: DDto;
}
export declare class HandleNestedQueryDto {
    x: string;
    y: string[];
    z: ZDto;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleOutput
 * -------------------------------------------------------------------------
 */
export declare class HandleOutputQueryDto {
    helloOutput: string;
}
export declare class HandleOutputOutputDto {
    hello: string;
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for handleStream
 * -------------------------------------------------------------------------
 */
export declare class HandleStreamQueryDto {
    values: string[];
}
/**
 * -------------------------------------------------------------------------
 * DTOs for handleStream with iteration
 * -------------------------------------------------------------------------
 * */
export declare class IterationDto {
    value: 'a' | 'b' | 'c' | 'd';
}
/**
 * -------------------------------------------------------------------------
 *  DTOs for values with a, b, c, d
 * -------------------------------------------------------------------------
 */
export declare class QueryValuesDto {
    values: string[];
}
export declare class RequiredObject {
    requiredField: string;
    optionalField?: number;
}
export declare class StrictObject {
    knownField: string;
}
declare class AllOfDtoA {
    a: string;
}
declare class AllOfDtoB {
    b: number;
}
export declare class ComplainingDto {
    enum_value: 'a' | 'b' | 'c';
    num_minimum: number;
    num_maximum: number;
    num_exclusiveMinimum: number;
    num_exclusiveMaximum: number;
    num_multipleOf: number;
    num_int: number;
    num_int32: number;
    str_minLength: string;
    str_maxLength: string;
    str_pattern: string;
    str_email: string;
    str_url: string;
    str_uuid: string;
    str_datetime: string;
    arr_minItems: string[];
    arr_maxItems: string[];
    obj_required: RequiredObject;
    obj_strict: StrictObject;
    logical_anyOf: string | number | boolean;
    logical_allOf: AllOfDtoA & AllOfDtoB;
}
export {};
