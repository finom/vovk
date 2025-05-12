import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';
import DtoControllerAndServiceEntityService from './DtoControllerAndServiceEntityService';
class GetDtoControllerAndServiceEntitiesQueryDto {
    search;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], GetDtoControllerAndServiceEntitiesQueryDto.prototype, "search", void 0);
class UpdateDtoControllerAndServiceEntityBodyDto {
    foo;
}
__decorate([
    IsIn(['bar', 'baz']),
    __metadata("design:type", String)
], UpdateDtoControllerAndServiceEntityBodyDto.prototype, "foo", void 0);
class UpdateDtoControllerAndServiceEntityQueryDto {
    q;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], UpdateDtoControllerAndServiceEntityQueryDto.prototype, "q", void 0);
let DtoControllerAndServiceEntityController = class DtoControllerAndServiceEntityController {
    static getDtoControllerAndServiceEntities = withDto({
        query: GetDtoControllerAndServiceEntitiesQueryDto,
        handle(req) {
            const { search } = req.vovk.query();
            return DtoControllerAndServiceEntityService.getDtoControllerAndServiceEntities(search);
        },
    });
    static updateDtoControllerAndServiceEntity = withDto({
        body: UpdateDtoControllerAndServiceEntityBodyDto,
        query: UpdateDtoControllerAndServiceEntityQueryDto,
        async handle(req, params) {
            const { id } = params;
            const body = await req.vovk.body();
            const { q } = req.vovk.query();
            return DtoControllerAndServiceEntityService.updateDtoControllerAndServiceEntity(id, q, body);
        },
    });
    static createDtoControllerAndServiceEntity = () => {
        // ...
    };
    static deleteDtoControllerAndServiceEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], DtoControllerAndServiceEntityController, "getDtoControllerAndServiceEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], DtoControllerAndServiceEntityController, "updateDtoControllerAndServiceEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], DtoControllerAndServiceEntityController, "createDtoControllerAndServiceEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], DtoControllerAndServiceEntityController, "deleteDtoControllerAndServiceEntity", void 0);
DtoControllerAndServiceEntityController = __decorate([
    prefix('dto-controller-and-service-entities')
], DtoControllerAndServiceEntityController);
export default DtoControllerAndServiceEntityController;
//# sourceMappingURL=DtoControllerAndServiceEntityController.js.map