export default class ZodControllerOnlyEntityController {
    static getZodControllerOnlyEntities: ((req: import("vovk").VovkRequest<undefined, {
        search: string;
    }, undefined>) => {
        results: never[];
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateZodControllerOnlyEntity: ((req: import("vovk").VovkRequest<{
        foo: "bar" | "baz";
    }, {
        q: string;
    }, {
        id: string;
    }>, params: {
        id: string;
    }) => Promise<{
        id: string;
        body: {
            foo: "bar" | "baz";
        };
        q: string;
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createZodControllerOnlyEntity: () => void;
    static deleteZodControllerOnlyEntity: () => void;
}
