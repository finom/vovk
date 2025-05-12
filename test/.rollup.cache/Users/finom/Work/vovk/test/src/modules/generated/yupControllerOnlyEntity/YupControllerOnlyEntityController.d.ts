export default class YupControllerOnlyEntityController {
    static getYupControllerOnlyEntities: ((req: import("vovk").VovkRequest<any, {
        search?: string | undefined;
    }, any>) => {
        results: never[];
        search: string | undefined;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateYupControllerOnlyEntity: ((req: import("vovk").VovkRequest<{
        foo: {};
    }, {
        q?: string | undefined;
    }, any>, params: {
        id: string;
    }) => Promise<{
        id: string;
        body: {
            foo: {};
        };
        q: string | undefined;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createYupControllerOnlyEntity: () => void;
    static deleteYupControllerOnlyEntity: () => void;
}
