import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withYup } from 'vovk-yup';
import * as yup from 'yup';
let YupControllerOnlyEntityController = class YupControllerOnlyEntityController {
    static getYupControllerOnlyEntities = withYup({
        query: yup.object({ search: yup.string() }),
        handle(req) {
            const search = req.nextUrl.searchParams.get('search');
            return { results: [], search };
        },
    });
    static updateYupControllerOnlyEntity = withYup({
        body: yup.object({
            foo: yup.mixed().oneOf(['bar', 'baz']).required(),
        }),
        query: yup.object({ q: yup.string() }),
        async handle(req, params) {
            const { id } = params;
            const body = await req.json();
            const q = req.nextUrl.searchParams.get('q');
            return { id, body, q };
        },
    });
    static createYupControllerOnlyEntity = () => {
        // ...
    };
    static deleteYupControllerOnlyEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], YupControllerOnlyEntityController, "getYupControllerOnlyEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], YupControllerOnlyEntityController, "updateYupControllerOnlyEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], YupControllerOnlyEntityController, "createYupControllerOnlyEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], YupControllerOnlyEntityController, "deleteYupControllerOnlyEntity", void 0);
YupControllerOnlyEntityController = __decorate([
    prefix('yup-controller-only-entities')
], YupControllerOnlyEntityController);
export default YupControllerOnlyEntityController;
//# sourceMappingURL=YupControllerOnlyEntityController.js.map