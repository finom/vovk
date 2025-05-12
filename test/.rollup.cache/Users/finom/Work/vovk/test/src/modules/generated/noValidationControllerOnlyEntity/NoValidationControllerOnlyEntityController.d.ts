import { type VovkRequest } from 'vovk';
export default class NoValidationControllerOnlyEntityController {
    static getNoValidationControllerOnlyEntities: (req: VovkRequest<null, {
        search: string;
    }>) => Promise<{
        results: never[];
        search: string;
    }>;
    static updateNoValidationControllerOnlyEntity: (req: VovkRequest<{
        foo: "bar" | "baz";
    }, {
        q: string;
    }>, params: {
        id: string;
    }) => Promise<{
        id: string;
        body: {
            foo: "bar" | "baz";
        };
        q: string;
    }>;
    static createNoValidationControllerOnlyEntity: () => void;
    static deleteNoValidationControllerOnlyEntity: () => void;
}
