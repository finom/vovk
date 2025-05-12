import { type VovkRequest } from 'vovk';
export default class NoValidationControllerAndServiceEntityController {
    static getNoValidationControllerAndServiceEntities: (req: VovkRequest<null, {
        search: string;
    }>) => Promise<{
        results: never[];
        search: string;
    }>;
    static updateNoValidationControllerAndServiceEntity: (req: VovkRequest<{
        foo: "bar" | "baz";
    }, {
        q: string;
    }>, params: {
        id: string;
    }) => Promise<{
        id: string;
        q: string;
        body: {
            foo: "bar" | "baz";
        };
    }>;
    static createNoValidationControllerAndServiceEntity: () => void;
    static deleteNoValidationControllerAndServiceEntity: () => void;
}
