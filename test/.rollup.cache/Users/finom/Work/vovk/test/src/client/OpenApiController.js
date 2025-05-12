import { __decorate, __metadata } from "tslib";
import { get, HttpStatus, prefix } from 'vovk';
import { openapi, fromSchema } from 'vovk-openapi';
import { fullSchema } from 'vovk-client';
let OpenApiController = class OpenApiController {
    static getFromSchema() {
        return fromSchema('api', fullSchema, {
            info: {
                title: 'Hello, OpenAPI!',
                version: '1.0.0',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                },
            ],
        });
    }
};
__decorate([
    get(),
    openapi({
        summary: 'Hello, World!',
    }),
    openapi.error(HttpStatus.I_AM_A_TEAPOT, 'I am a teapot error'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OpenApiController, "getFromSchema", null);
OpenApiController = __decorate([
    prefix('openapi')
], OpenApiController);
export default OpenApiController;
//# sourceMappingURL=OpenApiController.js.map