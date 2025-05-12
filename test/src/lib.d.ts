import supertest from 'supertest';
import type { KnownAny } from 'vovk';
export declare const apiUrl: string;
export declare const request: import("supertest/lib/agent")<supertest.SuperTestStatic.Test>;
export declare function expectPromise(f: () => Promise<unknown>): {
    rejects: {
        toThrow: (reg?: RegExp) => Promise<void>;
        toThrowError: (cl: KnownAny) => Promise<void>;
    };
};
export declare const NESTED_QUERY_EXAMPLE: {
    x: string;
    y: string[];
    z: {
        f: string;
        u: string[];
        d: {
            x: string;
            arrOfObjects: ({
                foo: string;
                nestedArr: string[];
                nestedObj?: undefined;
            } | {
                foo: string;
                nestedObj: {
                    deepKey: string;
                };
                nestedArr?: undefined;
            })[];
        };
    };
};
/**
 * Returns an object that follows the ComplaiingModel schema but violates exactly
 * one validation constraint specified by the key parameter.
 */
export declare function getComplainingObject(key: string | null): {
    enum_value: "a" | "b" | "c";
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
    obj_required: {
        optionalField?: number | undefined;
        requiredField: string;
    };
    obj_strict: {
        knownField: string;
    };
    logical_anyOf: string | number | boolean;
    logical_allOf: {
        a: string;
    } & {
        b: number;
    };
};
