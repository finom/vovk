declare class GetDtoControllerAndServiceEntitiesQueryDto {
    search: string;
}
declare class UpdateDtoControllerAndServiceEntityBodyDto {
    foo: 'bar' | 'baz';
}
declare class UpdateDtoControllerAndServiceEntityQueryDto {
    q: string;
}
export default class DtoControllerAndServiceEntityController {
    static getDtoControllerAndServiceEntities: ((req: import("vovk").VovkRequest<any, GetDtoControllerAndServiceEntitiesQueryDto, any>) => {
        results: never[];
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateDtoControllerAndServiceEntity: ((req: import("vovk").VovkRequest<UpdateDtoControllerAndServiceEntityBodyDto, UpdateDtoControllerAndServiceEntityQueryDto, any>, params: {
        id: string;
    }) => Promise<{
        id: string;
        q: string;
        body: UpdateDtoControllerAndServiceEntityBodyDto;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createDtoControllerAndServiceEntity: () => void;
    static deleteDtoControllerAndServiceEntity: () => void;
}
export {};
