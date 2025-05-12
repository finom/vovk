import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type ZodControllerAndServiceEntityController from './ZodControllerAndServiceEntityController';
export default class ZodControllerAndServiceEntityService {
    static getZodControllerAndServiceEntities: (search: VovkControllerQuery<typeof ZodControllerAndServiceEntityController.getZodControllerAndServiceEntities>["search"]) => {
        results: never[];
        search: string;
    };
    static updateZodControllerAndServiceEntity: (id: string, q: VovkControllerQuery<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>["q"], body: VovkControllerBody<typeof ZodControllerAndServiceEntityController.updateZodControllerAndServiceEntity>) => {
        id: string;
        q: string;
        body: {
            foo: "bar" | "baz";
        };
    };
}
