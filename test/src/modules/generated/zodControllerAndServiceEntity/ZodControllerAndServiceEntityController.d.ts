export default class ZodControllerAndServiceEntityController {
    static getZodControllerAndServiceEntities: ((req: import("vovk").VovkRequest<undefined, {
        search: string;
    }, undefined>) => {
        results: never[];
        search: string;
    }) & {
        __output: any;
        __iteration: any;
    };
    static updateZodControllerAndServiceEntity: ((req: import("vovk").VovkRequest<{
        foo: "bar" | "baz";
    }, {
        q: string;
    }, {
        id: string;
    }>, params: {
        id: string;
    }) => Promise<{
        id: string;
        q: string;
        body: {
            foo: "bar" | "baz";
        };
    }>) & {
        __output: any;
        __iteration: any;
    };
    static createZodControllerAndServiceEntity: () => void;
    static deleteZodControllerAndServiceEntity: () => void;
}
