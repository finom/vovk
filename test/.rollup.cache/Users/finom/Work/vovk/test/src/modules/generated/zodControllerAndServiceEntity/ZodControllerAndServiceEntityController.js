import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withZod } from 'vovk-zod';
import { z } from 'zod';
import ZodControllerAndServiceEntityService from './ZodControllerAndServiceEntityService';
let ZodControllerAndServiceEntityController = class ZodControllerAndServiceEntityController {
    static getZodControllerAndServiceEntities = withZod({
        query: z.object({ search: z.string() }),
        handle(req) {
            const search = req.nextUrl.searchParams.get('search');
            return ZodControllerAndServiceEntityService.getZodControllerAndServiceEntities(search);
        },
    });
    static updateZodControllerAndServiceEntity = withZod({
        body: z.object({
            foo: z.union([z.literal('bar'), z.literal('baz')]),
        }),
        query: z.object({ q: z.string() }),
        params: z.object({ id: z.string() }),
        async handle(req, params) {
            const { id } = params;
            const body = await req.json();
            const q = req.nextUrl.searchParams.get('q');
            return ZodControllerAndServiceEntityService.updateZodControllerAndServiceEntity(id, q, body);
        },
    });
    static createZodControllerAndServiceEntity = () => {
        // ...
    };
    static deleteZodControllerAndServiceEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], ZodControllerAndServiceEntityController, "getZodControllerAndServiceEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], ZodControllerAndServiceEntityController, "updateZodControllerAndServiceEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], ZodControllerAndServiceEntityController, "createZodControllerAndServiceEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], ZodControllerAndServiceEntityController, "deleteZodControllerAndServiceEntity", void 0);
ZodControllerAndServiceEntityController = __decorate([
    prefix('zod-controller-and-service-entities')
], ZodControllerAndServiceEntityController);
export default ZodControllerAndServiceEntityController;
//# sourceMappingURL=ZodControllerAndServiceEntityController.js.map