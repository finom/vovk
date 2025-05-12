import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type DtoControllerAndServiceEntityController from './DtoControllerAndServiceEntityController';
export default class DtoControllerAndServiceEntityService {
    static getDtoControllerAndServiceEntities: (search: VovkControllerQuery<typeof DtoControllerAndServiceEntityController.getDtoControllerAndServiceEntities>["search"]) => {
        results: never[];
        search: string;
    };
    static updateDtoControllerAndServiceEntity: (id: string, q: VovkControllerQuery<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>["q"], body: VovkControllerBody<typeof DtoControllerAndServiceEntityController.updateDtoControllerAndServiceEntity>) => {
        id: string;
        q: string;
        body: {
            foo: "bar" | "baz";
        };
    };
}
