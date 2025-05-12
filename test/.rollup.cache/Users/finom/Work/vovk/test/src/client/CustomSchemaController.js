import { __decorate, __metadata } from "tslib";
import { createDecorator, get } from 'vovk';
const custom = createDecorator(null, (hello) => {
    return (handlerSchema) => {
        return {
            ...handlerSchema,
            misc: {
                ...handlerSchema?.misc,
                hello,
            },
        };
    };
});
export default class CustomSchemaController {
    // The endpoint itself isn't going to be tested, it modifies .vovk.json that in its turn is tested
    static getWithCustomSchema() {
        return null;
    }
}
__decorate([
    get.auto(),
    custom('world'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomSchemaController, "getWithCustomSchema", null);
//# sourceMappingURL=CustomSchemaController.js.map