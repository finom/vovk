import { __decorate, __metadata } from "tslib";
import { post, put, get, prefix, HttpStatus, } from 'vovk';
import { openapi } from 'vovk-openapi';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';
export const ComplaiingModel = yup.object({
    enum_value: yup.string().oneOf(['a', 'b', 'c']),
    // Number validations
    num_minimum: yup.number().min(1),
    num_maximum: yup.number().max(100),
    num_exclusiveMinimum: yup.number().moreThan(1),
    num_exclusiveMaximum: yup.number().lessThan(100),
    num_multipleOf: yup.number(), // not supported for schema emission
    num_int: yup.number().integer(),
    num_int32: yup.number().integer().max(2147483647).min(-2147483648),
    // String validations
    str_minLength: yup.string().min(3),
    str_maxLength: yup.string().max(50),
    str_pattern: yup.string().matches(/^[A-Z][a-z]*$/),
    str_email: yup.string().email(),
    str_url: yup.string().url(),
    str_uuid: yup.string().matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
    str_datetime: yup.string().datetime(),
    // Array validations
    arr_minItems: yup.array().of(yup.string()).min(1),
    arr_maxItems: yup.array().of(yup.string()).max(10),
    obj_required: yup.object({
        requiredField: yup.string().required(),
        optionalField: yup.number().optional(),
    }),
    obj_strict: yup
        .object({
        knownField: yup.string(),
    })
        .noUnknown(true),
    // Logical compositions (num, str, bool)
    logical_anyOf: yup.string().max(5), // WARNING: not supported for schema emission
    // Intersection approximation in Yup
    logical_allOf: yup.object({
        a: yup.string().required(),
        b: yup.number().required(),
    }),
});
// check if the "circular" types don't error
class WithYupClientService {
    static handleAll({ body, query, params, vovkParams, }) {
        return { body, query, params, vovkParams };
    }
}
let WithYupClientController = class WithYupClientController {
    static handleAll = withYup({
        body: yup.object({ hello: yup.string().max(5).required() }),
        query: yup.object({ search: yup.string().max(5).required() }),
        params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }),
        output: yup.object({
            body: yup.object({ hello: yup.string().max(5).required() }).required(),
            query: yup.object({ search: yup.string().max(5).required() }).required(),
            params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }).required(),
            vovkParams: yup
                .object({
                foo: yup.string().max(5).required(),
                bar: yup.string().max(5).required(),
            })
                .required(),
        }),
        handle: async (req, params) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            const vovkParams = req.vovk.params();
            return WithYupClientService.handleAll({
                body,
                query: { search },
                params,
                vovkParams,
            });
        },
    });
    static handleQuery = withYup({
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: (req) => req.vovk.query(),
    });
    static handleBody = withYup({
        body: yup.object({ hello: yup.string().max(5).required() }),
        handle: async (req) => req.vovk.body(),
    });
    static handleParams = withYup({
        params: yup.object({ foo: yup.string().max(5).required(), bar: yup.string().max(5).required() }),
        handle: async (req) => req.vovk.params(),
    });
    static handleNestedQuery = withYup({
        query: yup.object({
            x: yup.string().max(5).required(),
            y: yup.array().of(yup.string().required()).required(),
            z: yup
                .object({
                f: yup.string().required(),
                u: yup.array().of(yup.string().required()).required(),
                d: yup
                    .object({
                    x: yup.string().required(),
                    arrOfObjects: yup
                        .array()
                        .of(yup.object({
                        foo: yup.string().required(),
                        nestedArr: yup.array().of(yup.string()).optional(),
                        nestedObj: yup
                            .object({
                            deepKey: yup.string().optional(),
                        })
                            .optional(),
                    }))
                        .required(),
                })
                    .required(),
            })
                .required(),
        }),
        handle: (req) => req.vovk.query(),
    });
    static handleOutput = withYup({
        query: yup.object({ helloOutput: yup.string().required() }),
        output: yup.object({ hello: yup.string().max(5).required() }),
        handle: async (req) => ({ hello: req.vovk.query().helloOutput }),
    });
    static handleStream = withYup({
        query: yup.object({ values: yup.array().of(yup.string().required()).required() }),
        iteration: yup.object({ value: yup.string().max(5).required() }),
        async *handle(req) {
            for (const value of req.vovk.query().values) {
                yield { value };
            }
        },
    });
    static handleSchemaComplaints = withYup({
        body: ComplaiingModel,
        handle: async (req) => {
            return req.json();
        },
    });
    static handleNothitng = withYup({
        handle: async () => ({ nothing: 'here' }),
    });
    static handleFormData = withYup({
        body: withYup.formData,
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: async (req) => {
            const formData = await req.vovk.form();
            const search = req.vovk.query().search;
            return { formData, search };
        },
    });
    static disableServerSideValidationBool = withYup({
        disableServerSideValidation: true,
        body: yup.object({ hello: yup.string().max(5).required() }),
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static disableServerSideValidationStrings = withYup({
        disableServerSideValidation: ['body'],
        body: yup.object({ hello: yup.string().max(5).required() }),
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static skipSchemaEmissionBool = withYup({
        skipSchemaEmission: true,
        body: yup.object({ hello: yup.string().max(5).required() }),
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static skipSchemaEmissionStrings = withYup({
        skipSchemaEmission: ['body'],
        body: yup.object({ hello: yup.string().max(5).required() }),
        query: yup.object({ search: yup.string().max(5).required() }),
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static validateEachIteration = withYup({
        validateEachIteration: true,
        query: yup.object({ values: yup.array().of(yup.string().required()).required() }),
        iteration: yup.object({ value: yup.string().max(5).required() }),
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
], WithYupClientController, "handleAll", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleQuery", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleBody", void 0);
__decorate([
    put('x/:foo/:bar/y'),
    __metadata("design:type", Object)
], WithYupClientController, "handleParams", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleNestedQuery", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleOutput", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleStream", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleSchemaComplaints", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleNothitng", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "handleFormData", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "disableServerSideValidationBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "disableServerSideValidationStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "skipSchemaEmissionBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "skipSchemaEmissionStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithYupClientController, "validateEachIteration", void 0);
WithYupClientController = __decorate([
    prefix('with-yup')
], WithYupClientController);
export default WithYupClientController;
//# sourceMappingURL=WithYupClientController.js.map