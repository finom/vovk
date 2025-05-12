import * as z from 'zod';
export declare const ComplainingModel: z.ZodObject<{
    enum_value: z.ZodEnum<["a", "b", "c"]>;
    num_minimum: z.ZodNumber;
    num_maximum: z.ZodNumber;
    num_exclusiveMinimum: z.ZodNumber;
    num_exclusiveMaximum: z.ZodNumber;
    num_multipleOf: z.ZodNumber;
    num_int: any;
    num_int32: any;
    str_minLength: z.ZodString;
    str_maxLength: z.ZodString;
    str_pattern: z.ZodString;
    str_email: any;
    str_url: any;
    str_uuid: any;
    str_datetime: any;
    arr_minItems: z.ZodArray<z.ZodString, "many">;
    arr_maxItems: z.ZodArray<z.ZodString, "many">;
    obj_required: z.ZodObject<{
        requiredField: z.ZodString;
        optionalField: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requiredField: string;
        optionalField?: number | undefined;
    }, {
        requiredField: string;
        optionalField?: number | undefined;
    }>;
    obj_strict: z.ZodObject<{
        knownField: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        knownField: string;
    }, {
        knownField: string;
    }>;
    logical_anyOf: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>;
    logical_allOf: z.ZodIntersection<z.ZodObject<{
        a: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        a: string;
    }, {
        a: string;
    }>, z.ZodObject<{
        b: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        b: number;
    }, {
        b: number;
    }>>;
}, "strip", z.ZodTypeAny, {
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
}, {
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
}>;
export default class WithZodClientController {
    static handleAll: ((req: import("vovk").VovkRequest<any, any, any>, params: any) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleQuery: ((req: import("vovk").VovkRequest<undefined, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleBody: ((req: import("vovk").VovkRequest<any, undefined, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleParams: ((req: import("vovk").VovkRequest<undefined, undefined, any>, params: any) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleNestedQuery: ((req: import("vovk").VovkRequest<undefined, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleOutput: ((req: import("vovk").VovkRequest<undefined, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleStream: ((req: import("vovk").VovkRequest<undefined, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleSchemaComplaints: ((req: import("vovk").VovkRequest<any, undefined, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static handleNothitng: (() => Promise<{
        readonly nothing: "here";
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleFormData: ((req: import("vovk").VovkRequest<FormData, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationBool: ((req: import("vovk").VovkRequest<any, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationStrings: ((req: import("vovk").VovkRequest<any, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionBool: ((req: import("vovk").VovkRequest<any, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionStrings: ((req: import("vovk").VovkRequest<any, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
    static validateEachIteration: ((req: import("vovk").VovkRequest<undefined, any, undefined>, params: Record<string, string>) => import("vovk").KnownAny) & {
        __output: any;
        __iteration: any;
    };
}
