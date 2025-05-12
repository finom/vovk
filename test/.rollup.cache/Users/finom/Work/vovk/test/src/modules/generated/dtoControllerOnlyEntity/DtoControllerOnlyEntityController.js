import { __decorate, __metadata } from "tslib";
import { prefix, get, put, post, del } from 'vovk';
import { withDto } from 'vovk-dto';
import { IsString, IsIn } from 'class-validator';
class GetDtoControllerOnlyEntitiesQueryDto {
    search;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], GetDtoControllerOnlyEntitiesQueryDto.prototype, "search", void 0);
class UpdateDtoControllerOnlyEntityBodyDto {
    foo;
}
__decorate([
    IsIn(['bar', 'baz']),
    __metadata("design:type", String)
], UpdateDtoControllerOnlyEntityBodyDto.prototype, "foo", void 0);
class UpdateDtoControllerOnlyEntityQueryDto {
    q;
}
__decorate([
    IsString(),
    __metadata("design:type", String)
], UpdateDtoControllerOnlyEntityQueryDto.prototype, "q", void 0);
let DtoControllerOnlyEntityController = class DtoControllerOnlyEntityController {
    static getDtoControllerOnlyEntities = withDto({
        query: GetDtoControllerOnlyEntitiesQueryDto,
        handle(req) {
            const { search } = req.vovk.query();
            return { results: [], search };
        },
    });
    static updateDtoControllerOnlyEntity = withDto({
        body: UpdateDtoControllerOnlyEntityBodyDto,
        query: UpdateDtoControllerOnlyEntityQueryDto,
        async handle(req, params) {
            const { id } = params;
            const body = await req.vovk.body();
            const { q } = req.vovk.query();
            return { id, body, q };
        },
    });
    static createDtoControllerOnlyEntity = () => {
        // ...
    };
    static deleteDtoControllerOnlyEntity = () => {
        // ...
    };
};
__decorate([
    get(),
    __metadata("design:type", Object)
], DtoControllerOnlyEntityController, "getDtoControllerOnlyEntities", void 0);
__decorate([
    put(':id'),
    __metadata("design:type", Object)
], DtoControllerOnlyEntityController, "updateDtoControllerOnlyEntity", void 0);
__decorate([
    post(),
    __metadata("design:type", Object)
], DtoControllerOnlyEntityController, "createDtoControllerOnlyEntity", void 0);
__decorate([
    del(':id'),
    __metadata("design:type", Object)
], DtoControllerOnlyEntityController, "deleteDtoControllerOnlyEntity", void 0);
DtoControllerOnlyEntityController = __decorate([
    prefix('dto-controller-only-entities')
], DtoControllerOnlyEntityController);
export default DtoControllerOnlyEntityController;
//# sourceMappingURL=DtoControllerOnlyEntityController.js.map