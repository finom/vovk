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
    [x: string]: any;
    enum_value?: unknown;
    num_minimum?: unknown;
    num_maximum?: unknown;
    num_exclusiveMinimum?: unknown;
    num_exclusiveMaximum?: unknown;
    num_multipleOf?: unknown;
    num_int?: unknown;
    num_int32?: unknown;
    str_minLength?: unknown;
    str_maxLength?: unknown;
    str_pattern?: unknown;
    str_email?: unknown;
    str_url?: unknown;
    str_uuid?: unknown;
    str_datetime?: unknown;
    arr_minItems?: unknown;
    arr_maxItems?: unknown;
    obj_required?: unknown;
    obj_strict?: unknown;
    logical_anyOf?: unknown;
    logical_allOf?: unknown;
};
