import * as z from 'zod';
export declare const ComplainingModel: z.ZodObject<{
    enum_value: z.ZodEnum<{
        a: "a";
        b: "b";
        c: "c";
    }>;
    num_minimum: z.ZodNumber;
    num_maximum: z.ZodNumber;
    num_exclusiveMinimum: z.ZodNumber;
    num_exclusiveMaximum: z.ZodNumber;
    num_multipleOf: z.ZodNumber;
    num_int: z.ZodInt;
    num_int32: z.ZodInt32;
    str_minLength: z.ZodString;
    str_maxLength: z.ZodString;
    str_pattern: z.ZodString;
    str_email: z.ZodEmail;
    str_url: z.ZodURL;
    str_uuid: z.ZodUUID;
    str_datetime: z.iso.ZodISODateTime;
    arr_minItems: z.ZodArray<z.ZodString>;
    arr_maxItems: z.ZodArray<z.ZodString>;
    obj_required: z.ZodObject<{
        requiredField: z.ZodString;
        optionalField: z.ZodOptional<z.ZodNumber>;
    }, {}>;
    obj_strict: z.ZodObject<{
        knownField: z.ZodString;
    }, {}>;
    logical_anyOf: z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean]>;
    logical_allOf: z.ZodIntersection<z.ZodObject<{
        a: z.ZodString;
    }, {}>, z.ZodObject<{
        b: z.ZodNumber;
    }, {}>>;
}, {}>;
export default class WithZodClientController {
    static handleAll: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, {
        search: string;
    }, {
        foo: string;
        bar: string;
    }>, params: {
        foo: string;
        bar: string;
    }) => Promise<{
        body: {
            hello: string;
        };
        query: {
            search: string;
        };
        params: {
            foo: string;
            bar: string;
        };
        vovkParams: {
            foo: string;
            bar: string;
        };
    }>) & {
        __output: {
            body: {
                hello: string;
            };
            query: {
                search: string;
            };
            params: {
                foo: string;
                bar: string;
            };
            vovkParams: {
                foo: string;
                bar: string;
            };
        };
        __iteration: any;
    };
    static handleQuery: ((req: import("vovk").VovkRequest<undefined, {
        search: string;
    }, undefined>) => {
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static handleBody: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, undefined, undefined>) => Promise<{
        hello: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleParams: ((req: import("vovk").VovkRequest<undefined, undefined, {
        foo: string;
        bar: string;
    }>) => Promise<{
        foo: string;
        bar: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleNestedQuery: ((req: import("vovk").VovkRequest<undefined, {
        x: string;
        y: string[];
        z: {
            f: string;
            u: string[];
            d: {
                x: string;
                arrOfObjects: {
                    nestedArr?: string[] | undefined;
                    nestedObj?: {
                        deepKey: string;
                    } | undefined;
                    foo: string;
                }[];
            };
        };
    }, undefined>) => {
        x: string;
        y: string[];
        z: {
            f: string;
            u: string[];
            d: {
                x: string;
                arrOfObjects: {
                    nestedArr?: string[] | undefined;
                    nestedObj?: {
                        deepKey: string;
                    } | undefined;
                    foo: string;
                }[];
            };
        };
    }) & {
        __output: any;
        __iteration: any;
    };
    static handleOutput: ((req: import("vovk").VovkRequest<undefined, {
        helloOutput: string;
    }, undefined>) => Promise<{
        hello: string;
    }>) & {
        __output: {
            hello: string;
        };
        __iteration: any;
    };
    static handleStream: ((req: import("vovk").VovkRequest<undefined, {
        values: string[];
    }, undefined>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: {
            value: string;
        };
    };
    static handleSchemaComplaints: ((req: import("vovk").VovkRequest<{
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
    }, undefined, undefined>) => Promise<{
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
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleNothitng: (() => Promise<{
        readonly nothing: "here";
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleFormData: ((req: import("vovk").VovkRequest<FormData, {
        search: string;
    }, undefined>) => Promise<{
        formData: {
            hello: "world";
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationBool: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, {
        search: string;
    }, undefined>) => Promise<{
        body: {
            hello: string;
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static disableServerSideValidationStrings: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, {
        search: string;
    }, undefined>) => Promise<{
        body: {
            hello: string;
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionBool: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, {
        search: string;
    }, undefined>) => Promise<{
        body: {
            hello: string;
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static skipSchemaEmissionStrings: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, {
        search: string;
    }, undefined>) => Promise<{
        body: {
            hello: string;
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static validateEachIteration: ((req: import("vovk").VovkRequest<undefined, {
        values: string[];
    }, undefined>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: {
            value: string;
        };
    };
}
