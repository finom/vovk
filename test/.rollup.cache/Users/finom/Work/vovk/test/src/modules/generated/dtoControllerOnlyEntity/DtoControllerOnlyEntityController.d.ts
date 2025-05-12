declare class GetDtoControllerOnlyEntitiesQueryDto {
    search: string;
}
declare class UpdateDtoControllerOnlyEntityBodyDto {
    foo: 'bar' | 'baz';
}
declare class UpdateDtoControllerOnlyEntityQueryDto {
    q: string;
}
export default class DtoControllerOnlyEntityController {
    static getDtoControllerOnlyEntities: ((req: import("vovk").VovkRequest<any, GetDtoControllerOnlyEntitiesQueryDto, any>) => {
        results: never[];
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateDtoControllerOnlyEntity: ((req: import("vovk").VovkRequest<UpdateDtoControllerOnlyEntityBodyDto, UpdateDtoControllerOnlyEntityQueryDto, any>, params: {
        id: string;
    }) => Promise<{
        id: string;
        body: UpdateDtoControllerOnlyEntityBodyDto;
        q: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createDtoControllerOnlyEntity: () => void;
    static deleteDtoControllerOnlyEntity: () => void;
}
export {};
