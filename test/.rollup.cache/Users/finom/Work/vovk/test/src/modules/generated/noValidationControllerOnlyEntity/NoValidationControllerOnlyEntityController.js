import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
let NoValidationControllerOnlyEntityController = class NoValidationControllerOnlyEntityController {
    static getNoValidationControllerOnlyEntities = async (req) => {
        const search = req.nextUrl.searchParams.get('search');
        return { results: [], search };
    };
    static updateNoValidationControllerOnlyEntity = async (req, params) => {
        const { id } = params;
        const body = await req.json();
        const q = req.nextUrl.searchParams.get('q');
        return { id, body, q };
    };
    static createNoValidationControllerOnlyEntity = () => {
        // ...
    };
    static deleteNoValidationControllerOnlyEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], NoValidationControllerOnlyEntityController, "getNoValidationControllerOnlyEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], NoValidationControllerOnlyEntityController, "updateNoValidationControllerOnlyEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], NoValidationControllerOnlyEntityController, "createNoValidationControllerOnlyEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], NoValidationControllerOnlyEntityController, "deleteNoValidationControllerOnlyEntity", void 0);
NoValidationControllerOnlyEntityController = __decorate([
    prefix('no-validation-controller-only-entities')
], NoValidationControllerOnlyEntityController);
export default NoValidationControllerOnlyEntityController;
//# sourceMappingURL=NoValidationControllerOnlyEntityController.js.map