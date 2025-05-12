import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';
import YupControllerAndServiceEntityService from './YupControllerAndServiceEntityService';
let YupControllerAndServiceEntityController = class YupControllerAndServiceEntityController {
    static getYupControllerAndServiceEntities = withYup({
        query: yup.object({ search: yup.string() }),
        handle(req) {
            const search = req.nextUrl.searchParams.get('search');
            return YupControllerAndServiceEntityService.getYupControllerAndServiceEntities(search);
        },
    });
    static updateYupControllerAndServiceEntity = withYup({
        body: yup.object({
            foo: yup.mixed().oneOf(['bar', 'baz']).required(),
        }),
        query: yup.object({ q: yup.string() }),
        async handle(req, params) {
            const { id } = params;
            const body = await req.json();
            const q = req.nextUrl.searchParams.get('q');
            return YupControllerAndServiceEntityService.updateYupControllerAndServiceEntity(id, q, body);
        },
    });
    static createYupControllerAndServiceEntity = () => {
        // ...
    };
    static deleteYupControllerAndServiceEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], YupControllerAndServiceEntityController, "getYupControllerAndServiceEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], YupControllerAndServiceEntityController, "updateYupControllerAndServiceEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], YupControllerAndServiceEntityController, "createYupControllerAndServiceEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], YupControllerAndServiceEntityController, "deleteYupControllerAndServiceEntity", void 0);
YupControllerAndServiceEntityController = __decorate([
    prefix('yup-controller-and-service-entities')
], YupControllerAndServiceEntityController);
export default YupControllerAndServiceEntityController;
//# sourceMappingURL=YupControllerAndServiceEntityController.js.map