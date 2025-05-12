import * as yup from 'yup';
export declare const ComplaiingModel: yup.ObjectSchema<{
    enum_value: string | undefined;
    num_minimum: number | undefined;
    num_maximum: number | undefined;
    num_exclusiveMinimum: number | undefined;
    num_exclusiveMaximum: number | undefined;
    num_multipleOf: number | undefined;
    num_int: number | undefined;
    num_int32: number | undefined;
    str_minLength: string | undefined;
    str_maxLength: string | undefined;
    str_pattern: string | undefined;
    str_email: string | undefined;
    str_url: string | undefined;
    str_uuid: string | undefined;
    str_datetime: string | undefined;
    arr_minItems: (string | undefined)[] | undefined;
    arr_maxItems: (string | undefined)[] | undefined;
    obj_required: {
        optionalField?: number | undefined;
        requiredField: string;
    };
    obj_strict: {
        knownField?: string | undefined;
    };
    logical_anyOf: string | number | boolean;
    logical_allOf: {
        a: string;
        b: number;
    };
}, yup.AnyObject, {
    enum_value: undefined;
    num_minimum: undefined;
    num_maximum: undefined;
    num_exclusiveMinimum: undefined;
    num_exclusiveMaximum: undefined;
    num_multipleOf: undefined;
    num_int: undefined;
    num_int32: undefined;
    str_minLength: undefined;
    str_maxLength: undefined;
    str_pattern: undefined;
    str_email: undefined;
    str_url: undefined;
    str_uuid: undefined;
    str_datetime: undefined;
    arr_minItems: "";
    arr_maxItems: "";
    obj_required: {
        requiredField: undefined;
        optionalField: undefined;
    };
    obj_strict: {
        knownField: undefined;
    };
    logical_anyOf: any;
    logical_allOf: {
        a: undefined;
        b: undefined;
    };
}, "">;
export default class WithYupClientController {
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
    static handleQuery: ((req: import("vovk").VovkRequest<any, {
        search: string;
    }, any>) => {
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static handleBody: ((req: import("vovk").VovkRequest<{
        hello: string;
    }, any, any>) => Promise<{
        hello: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleParams: ((req: import("vovk").VovkRequest<any, any, {
        foo: string;
        bar: string;
    }>) => Promise<{
        foo: string;
        bar: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static handleNestedQuery: ((req: import("vovk").VovkRequest<any, {
        x: string;
        y: string[];
        z: {
            f: string;
            u: string[];
            d: {
                x: string;
                arrOfObjects: {
                    nestedArr?: (string | undefined)[] | undefined;
                    nestedObj?: {
                        deepKey?: string | undefined;
                    } | undefined;
                    foo: string;
                }[];
            };
        };
    }, any>) => {
        x: string;
        y: string[];
        z: {
            f: string;
            u: string[];
            d: {
                x: string;
                arrOfObjects: {
                    nestedArr?: (string | undefined)[] | undefined;
                    nestedObj?: {
                        deepKey?: string | undefined;
                    } | undefined;
                    foo: string;
                }[];
            };
        };
    }) & {
        __output: any;
        __iteration: any;
    };
    static handleOutput: ((req: import("vovk").VovkRequest<any, {
        helloOutput: string;
    }, any>) => Promise<{
        hello: "world";
    }>) & {
        __output: {
            hello: string;
        };
        __iteration: any;
    };
    static handleStream: ((req: import("vovk").VovkRequest<any, {
        values: string[];
    }, any>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: {
            value: string;
        };
    };
    static handleSchemaComplaints: ((req: import("vovk").VovkRequest<{
        enum_value?: string | undefined;
        num_minimum?: number | undefined;
        num_maximum?: number | undefined;
        num_exclusiveMinimum?: number | undefined;
        num_exclusiveMaximum?: number | undefined;
        num_multipleOf?: number | undefined;
        num_int?: number | undefined;
        num_int32?: number | undefined;
        str_minLength?: string | undefined;
        str_maxLength?: string | undefined;
        str_pattern?: string | undefined;
        str_email?: string | undefined;
        str_url?: string | undefined;
        str_uuid?: string | undefined;
        str_datetime?: string | undefined;
        arr_minItems?: (string | undefined)[] | undefined;
        arr_maxItems?: (string | undefined)[] | undefined;
        obj_required: {
            optionalField?: number | undefined;
            requiredField: string;
        };
        obj_strict: {
            knownField?: string | undefined;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
            a: string;
            b: number;
        };
    }, any, any>) => Promise<{
        enum_value?: string | undefined;
        num_minimum?: number | undefined;
        num_maximum?: number | undefined;
        num_exclusiveMinimum?: number | undefined;
        num_exclusiveMaximum?: number | undefined;
        num_multipleOf?: number | undefined;
        num_int?: number | undefined;
        num_int32?: number | undefined;
        str_minLength?: string | undefined;
        str_maxLength?: string | undefined;
        str_pattern?: string | undefined;
        str_email?: string | undefined;
        str_url?: string | undefined;
        str_uuid?: string | undefined;
        str_datetime?: string | undefined;
        arr_minItems?: (string | undefined)[] | undefined;
        arr_maxItems?: (string | undefined)[] | undefined;
        obj_required: {
            optionalField?: number | undefined;
            requiredField: string;
        };
        obj_strict: {
            knownField?: string | undefined;
        };
        logical_anyOf: string | number | boolean;
        logical_allOf: {
            a: string;
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
    }, any>) => Promise<{
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
    }, any>) => Promise<{
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
    }, any>) => Promise<{
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
    }, any>) => Promise<{
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
    }, any>) => Promise<{
        body: {
            hello: string;
        };
        search: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static validateEachIteration: ((req: import("vovk").VovkRequest<any, {
        values: string[];
    }, any>) => AsyncGenerator<{
        value: string;
    }, void, unknown>) & {
        __output: any;
        __iteration: {
            value: string;
        };
    };
}
