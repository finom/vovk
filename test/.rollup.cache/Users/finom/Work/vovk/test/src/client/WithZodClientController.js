import { __decorate, __metadata } from "tslib";
import { post, put, get, prefix, HttpStatus, } from 'vovk';
import { openapi } from 'vovk-openapi';
import { withZod } from 'vovk-zod';
import * as z from 'zod';
export const ComplainingModel = z.object({
    enum_value: z.enum(['a', 'b', 'c']),
    // Number validations not in Rust
    num_minimum: z.number().min(1), // Minimum value (inclusive)
    num_maximum: z.number().max(100), // Maximum value (inclusive)
    num_exclusiveMinimum: z.number().gt(1), // Exclusive minimum
    num_exclusiveMaximum: z.number().lt(100), // Exclusive maximum
    num_multipleOf: z.number().multipleOf(5), // Must be multiple of value
    num_int: z.int(), // Must be an integer
    num_int32: z.int32(), // Must be an integer with max 32 bits
    // String validations not in Rust
    str_minLength: z.string().min(3), // Minimum string length
    str_maxLength: z.string().max(50), // Maximum string length
    str_pattern: z.string().regex(/^[A-Z][a-z]*$/), // Must match regex pattern
    str_email: z.email(), // Email format
    str_url: z.url(), // URL format
    str_uuid: z.uuid(), // UUID format
    str_datetime: z.iso.datetime(), // ISO datetime
    // Array validations not in Rust
    arr_minItems: z.array(z.string()).min(1), // Minimum items
    arr_maxItems: z.array(z.string()).max(10), // Maximum items
    obj_required: z.object({
        requiredField: z.string(),
        optionalField: z.number().optional(),
    }),
    obj_strict: z
        .object({
        knownField: z.string(),
    })
        .strict(), // No additional properties allowed
    // Logical compositions
    logical_anyOf: z.union([z.string().max(5), z.number(), z.boolean()]), // One of these types
    logical_allOf: z.intersection(z.object({ a: z.string() }), z.object({ b: z.number() })),
});
// check if the "circular" types don't error
class WithZodClientService {
    static handleAll({ body, query, params, vovkParams, }) {
        return { body, query, params, vovkParams };
    }
}
let WithZodClientController = class WithZodClientController {
    static handleAll = withZod({
        body: z.object({ hello: z.string() }),
        query: z.object({ search: z.string() }),
        params: z.object({ foo: z.string(), bar: z.string() }),
        output: z.object({
            body: z.object({ hello: z.string() }),
            query: z.object({ search: z.string() }),
            params: z.object({ foo: z.string(), bar: z.string() }),
            vovkParams: z.object({ foo: z.string(), bar: z.string() }),
        }),
        handle: async (req, params) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            const vovkParams = req.vovk.params();
            return WithZodClientService.handleAll({
                body,
                query: { search },
                params,
                vovkParams,
            });
        },
    });
    static handleQuery = withZod({
        query: z.object({ search: z.string().max(5) }),
        handle: (req) => {
            return req.vovk.query();
        },
    });
    static handleBody = withZod({
        body: z.object({ hello: z.string().max(5) }),
        handle: async (req) => {
            return req.vovk.body();
        },
    });
    static handleParams = withZod({
        params: z.object({ foo: z.string().max(5), bar: z.string().max(5) }),
        handle: async (req) => {
            return req.vovk.params();
        },
    });
    static handleNestedQuery = withZod({
        query: z.object({
            x: z.string().max(5),
            y: z.array(z.string()),
            z: z.object({
                f: z.string(),
                u: z.array(z.string()),
                d: z.object({
                    x: z.string(),
                    arrOfObjects: z.array(z.object({
                        foo: z.string(),
                        nestedArr: z.array(z.string()).optional(),
                        nestedObj: z
                            .object({
                            deepKey: z.string(),
                        })
                            .optional(),
                    })),
                }),
            }),
        }),
        handle: (req) => {
            return req.vovk.query();
        },
    });
    static handleOutput = withZod({
        query: z.object({ helloOutput: z.string() }),
        output: z.object({ hello: z.string().max(5) }),
        handle: async (req) => {
            return { hello: req.vovk.query().helloOutput };
        },
    });
    static handleStream = withZod({
        query: z.object({ values: z.string().array() }),
        iteration: z.object({ value: z.string().max(5) }),
        async *handle(req) {
            for (const value of req.vovk.query().values) {
                yield { value };
            }
        },
    });
    static handleSchemaComplaints = withZod({
        body: ComplainingModel,
        handle: async (req) => {
            return req.json();
        },
    });
    static handleNothitng = withZod({
        handle: async () => {
            return { nothing: 'here' };
        },
    });
    static handleFormData = withZod({
        body: withZod.formData,
        query: z.object({ search: z.string() }),
        handle: async (req) => {
            const formData = await req.vovk.form();
            const search = req.vovk.query().search;
            return { formData, search };
        },
    });
    static disableServerSideValidationBool = withZod({
        disableServerSideValidation: true,
        body: z.object({ hello: z.string().max(5) }),
        query: z.object({ search: z.string() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static disableServerSideValidationStrings = withZod({
        disableServerSideValidation: ['body'],
        body: z.object({ hello: z.string().max(5) }),
        query: z.object({ search: z.string().max(5) }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    // skipSchemaEmission
    static skipSchemaEmissionBool = withZod({
        skipSchemaEmission: true,
        body: z.object({ hello: z.string().max(5) }),
        query: z.object({ search: z.string() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static skipSchemaEmissionStrings = withZod({
        skipSchemaEmission: ['body'],
        body: z.object({ hello: z.string().max(5) }),
        query: z.object({ search: z.string() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static validateEachIteration = withZod({
        validateEachIteration: true,
        query: z.object({ values: z.string().array() }),
        iteration: z.object({ value: z.string().max(5) }),
        async *handle(req) {
            for (const value of req.vovk.query().values) {
                yield { value };
            }
        },
    });
};
__decorate([
    openapi({
        summary: 'This is a summary',
        description: 'This is a description',
    }),
    openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request'),
    post('all/:foo/:bar'),
    __metadata("design:type", Object)
], WithZodClientController, "handleAll", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleQuery", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleBody", void 0);
__decorate([
    put('x/:foo/:bar/y'),
    __metadata("design:type", Object)
], WithZodClientController, "handleParams", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleNestedQuery", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleOutput", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleStream", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleSchemaComplaints", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleNothitng", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "handleFormData", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "disableServerSideValidationBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "disableServerSideValidationStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "skipSchemaEmissionBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "skipSchemaEmissionStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithZodClientController, "validateEachIteration", void 0);
WithZodClientController = __decorate([
    prefix('with-zod')
], WithZodClientController);
export default WithZodClientController;
//# sourceMappingURL=WithZodClientController.js.map