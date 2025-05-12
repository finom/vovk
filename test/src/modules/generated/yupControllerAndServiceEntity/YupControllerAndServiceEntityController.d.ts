export default class YupControllerAndServiceEntityController {
    static getYupControllerAndServiceEntities: ((req: import("vovk").VovkRequest<any, {
        search?: string | undefined;
    }, any>) => {
        results: never[];
        search: string | undefined;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateYupControllerAndServiceEntity: ((req: import("vovk").VovkRequest<{
        foo: {};
    }, {
        q?: string | undefined;
    }, any>, params: {
        id: string;
    }) => Promise<{
        id: string;
        q: string | undefined;
        body: {
            foo: {};
        };
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createYupControllerAndServiceEntity: () => void;
    static deleteYupControllerAndServiceEntity: () => void;
}
