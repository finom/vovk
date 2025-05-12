import { __decorate, __metadata } from "tslib";
import { post, put, get, prefix, HttpStatus, } from 'vovk';
import { openapi } from 'vovk-openapi';
import { withDto } from 'vovk-dto';
import { validateOnClient } from 'vovk-dto/validateOnClient';
import { ComplainingDto, HandleAllBodyDto, HandleAllOutputDto, HandleAllParamsDto, HandleAllQueryDto, HandleBodyBodyDto, HandleNestedQueryDto, HandleOutputOutputDto, HandleOutputQueryDto, HandleParamsDto, HandleQueryQueryDto, HandleStreamQueryDto, IterationDto, QueryValuesDto, } from './WithDtoClientController.dto';
import { WithDtoClientControllerRPC } from 'vovk-client';
import { plainToInstance } from 'class-transformer';
import { ok } from 'node:assert';
class WithDtoClientService {
    static handleAll({ body, query, params, vovkParams, }) {
        return {
            body,
            query,
            params,
            vovkParams,
        };
    }
}
let WithDtoClientController = class WithDtoClientController {
    static handleAll = withDto({
        body: HandleAllBodyDto,
        query: HandleAllQueryDto,
        params: HandleAllParamsDto,
        output: HandleAllOutputDto,
        handle: async (req, params) => {
            const body = await req.vovk.body();
            const query = req.vovk.query();
            const vovkParams = req.vovk.params();
            ok(body instanceof HandleAllBodyDto, 'Body is not an instance of HandleAllBodyDto');
            ok(query instanceof HandleAllQueryDto, 'Query is not an instance of HandleAllQueryDto');
            ok(vovkParams instanceof HandleAllParamsDto, 'Params is not an instance of HandleAllParamsDto');
            return WithDtoClientService.handleAll({
                body,
                query,
                params,
                vovkParams,
            });
        },
    });
    static handleNestedQuery = withDto({
        query: HandleNestedQueryDto,
        handle: (req) => {
            return req.vovk.query();
        },
    });
    static handleNestedQueryClient = async (req) => {
        const query = { ...req.vovk.query() };
        return WithDtoClientControllerRPC.handleNestedQuery({
            query: plainToInstance(HandleNestedQueryDto, query),
            validateOnClient,
        });
    };
    static handleOutput = withDto({
        query: HandleOutputQueryDto,
        output: HandleOutputOutputDto,
        handle: async (req) => {
            // We expect the query.helloOutput to be "world" to match output shape
            return { hello: req.vovk.query().helloOutput };
        },
    });
    static handleOutputClient = async (req) => {
        const query = { helloOutput: req.nextUrl.searchParams.get('helloOutput') };
        return WithDtoClientControllerRPC.handleOutput({
            query: plainToInstance(HandleOutputQueryDto, query),
            validateOnClient,
        });
    };
    static handleStream = withDto({
        query: HandleStreamQueryDto,
        iteration: IterationDto,
        async *handle(req) {
            for (const value of req.vovk.query().values) {
                yield { value };
            }
        },
    });
    static handleSchemaComplaints = withDto({
        body: ComplainingDto,
        handle: async (req) => {
            return req.json();
        },
    });
    static handleNothitng = withDto({
        // no DTOs required here
        handle: async () => {
            return { nothing: 'here' };
        },
    });
    static handleFormData = withDto({
        body: withDto.formData,
        query: HandleQueryQueryDto,
        handle: async (req) => {
            const formData = await req.vovk.form();
            const search = req.vovk.query().search;
            return { formData, search };
        },
    });
    static disableServerSideValidationBool = withDto({
        disableServerSideValidation: true,
        body: HandleBodyBodyDto,
        query: HandleQueryQueryDto,
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static disableServerSideValidationStrings = withDto({
        disableServerSideValidation: ['body'],
        body: HandleBodyBodyDto,
        query: HandleQueryQueryDto,
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static skipSchemaEmissionBool = withDto({
        skipSchemaEmission: true,
        body: HandleBodyBodyDto,
        query: HandleQueryQueryDto,
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static skipSchemaEmissionStrings = withDto({
        skipSchemaEmission: ['body'],
        body: HandleBodyBodyDto,
        query: HandleQueryQueryDto,
        handle: async (req) => {
            const body = await req.json();
            const search = req.nextUrl.searchParams.get('search');
            return { body, search };
        },
    });
    static validateEachIteration = withDto({
        validateEachIteration: true,
        query: QueryValuesDto,
        iteration: IterationDto,
        async *handle(req) {
            for (const value of req.vovk.query().values) {
                yield { value };
            }
        },
    });
    // The tests are run on nodejs without TS compilator so decorators are not supported and it's not possible import a DTO at .test.ts file
    // this endpoint and other ones ended with "Client" implement a proxy to be able to test errors on client side
    static handleAllClient = async (req, params) => {
        const body = await req.json();
        const query = { search: req.nextUrl.searchParams.get('search') };
        const result = await WithDtoClientControllerRPC.handleAll({
            body: plainToInstance(HandleAllBodyDto, body),
            query: plainToInstance(HandleAllQueryDto, query),
            params: plainToInstance(HandleAllParamsDto, params),
            transform: (resp) => plainToInstance(HandleAllOutputDto, resp),
            validateOnClient,
        });
        ok(result instanceof HandleAllOutputDto, 'Output is not an instance of HandleAllOutputDto');
        return result;
    };
    static handleQuery = withDto({
        query: HandleQueryQueryDto,
        handle: (req) => {
            return req.vovk.query();
        },
    });
    static handleQueryClient = async (req) => {
        const query = { search: req.nextUrl.searchParams.get('search') };
        return WithDtoClientControllerRPC.handleQuery({
            query: plainToInstance(HandleQueryQueryDto, query),
            validateOnClient,
        });
    };
    static handleBody = withDto({
        body: HandleBodyBodyDto,
        handle: async (req) => {
            return req.vovk.body();
        },
    });
    static handleBodyClient = async (req) => {
        const body = await req.json();
        return WithDtoClientControllerRPC.handleBody({
            body: plainToInstance(HandleBodyBodyDto, body),
            validateOnClient,
        });
    };
    static handleParams = withDto({
        params: HandleParamsDto,
        handle: async (req) => {
            return req.vovk.params();
        },
    });
    static handleParamsClient = async (_req, params) => {
        return WithDtoClientControllerRPC.handleParams({
            params: plainToInstance(HandleParamsDto, params),
            validateOnClient,
        });
    };
};
__decorate([
    openapi({
        summary: 'This is a summary',
        description: 'This is a description',
    }),
    openapi.error(HttpStatus.BAD_REQUEST, 'This is a bad request'),
    post('all/:foo/:bar'),
    __metadata("design:type", Object)
], WithDtoClientController, "handleAll", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleNestedQuery", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleNestedQueryClient", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleOutput", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleOutputClient", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleStream", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleSchemaComplaints", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleNothitng", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleFormData", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "disableServerSideValidationBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "disableServerSideValidationStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "skipSchemaEmissionBool", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "skipSchemaEmissionStrings", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "validateEachIteration", void 0);
__decorate([
    post('all/:foo/:bar/client'),
    __metadata("design:type", Object)
], WithDtoClientController, "handleAllClient", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleQuery", void 0);
__decorate([
    get.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleQueryClient", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleBody", void 0);
__decorate([
    post.auto(),
    __metadata("design:type", Object)
], WithDtoClientController, "handleBodyClient", void 0);
__decorate([
    put('x/:foo/:bar/y'),
    __metadata("design:type", Object)
], WithDtoClientController, "handleParams", void 0);
__decorate([
    put('x/:foo/:bar/y/client'),
    __metadata("design:type", Object)
], WithDtoClientController, "handleParamsClient", void 0);
WithDtoClientController = __decorate([
    prefix('with-dto')
], WithDtoClientController);
export default WithDtoClientController;
//# sourceMappingURL=WithDtoClientController.js.map