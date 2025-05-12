import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';
let ZodControllerOnlyEntityController = class ZodControllerOnlyEntityController {
    static getZodControllerOnlyEntities = withZod({
        query: z.object({ search: z.string() }),
        handle(req) {
            const search = req.nextUrl.searchParams.get('search');
            return { results: [], search };
        },
    });
    static updateZodControllerOnlyEntity = withZod({
        body: z.object({
            foo: z.union([z.literal('bar'), z.literal('baz')]),
        }),
        query: z.object({ q: z.string() }),
        params: z.object({ id: z.string() }),
        async handle(req, params) {
            const { id } = params;
            const body = await req.json();
            const q = req.nextUrl.searchParams.get('q');
            return { id, body, q };
        },
    });
    static createZodControllerOnlyEntity = () => {
        // ...
    };
    static deleteZodControllerOnlyEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], ZodControllerOnlyEntityController, "getZodControllerOnlyEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], ZodControllerOnlyEntityController, "updateZodControllerOnlyEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], ZodControllerOnlyEntityController, "createZodControllerOnlyEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], ZodControllerOnlyEntityController, "deleteZodControllerOnlyEntity", void 0);
ZodControllerOnlyEntityController = __decorate([
    prefix('zod-controller-only-entities')
], ZodControllerOnlyEntityController);
export default ZodControllerOnlyEntityController;
//# sourceMappingURL=ZodControllerOnlyEntityController.js.map