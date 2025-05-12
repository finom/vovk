import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import NoValidationControllerAndServiceEntityService from './NoValidationControllerAndServiceEntityService';
let NoValidationControllerAndServiceEntityController = class NoValidationControllerAndServiceEntityController {
    static getNoValidationControllerAndServiceEntities = async (req) => {
        const search = req.nextUrl.searchParams.get('search');
        return NoValidationControllerAndServiceEntityService.getNoValidationControllerAndServiceEntities(search);
    };
    static updateNoValidationControllerAndServiceEntity = async (req, params) => {
        const { id } = params;
        const body = await req.json();
        const q = req.nextUrl.searchParams.get('q');
        return NoValidationControllerAndServiceEntityService.updateNoValidationControllerAndServiceEntity(id, q, body);
    };
    static createNoValidationControllerAndServiceEntity = () => {
        // ...
    };
    static deleteNoValidationControllerAndServiceEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], NoValidationControllerAndServiceEntityController, "getNoValidationControllerAndServiceEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], NoValidationControllerAndServiceEntityController, "updateNoValidationControllerAndServiceEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], NoValidationControllerAndServiceEntityController, "createNoValidationControllerAndServiceEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], NoValidationControllerAndServiceEntityController, "deleteNoValidationControllerAndServiceEntity", void 0);
NoValidationControllerAndServiceEntityController = __decorate([
    prefix('no-validation-controller-and-service-entities')
], NoValidationControllerAndServiceEntityController);
export default NoValidationControllerAndServiceEntityController;
//# sourceMappingURL=NoValidationControllerAndServiceEntityController.js.map