import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type YupControllerAndServiceEntityController from './YupControllerAndServiceEntityController';
export default class YupControllerAndServiceEntityService {
    static getYupControllerAndServiceEntities: (search: VovkControllerQuery<typeof YupControllerAndServiceEntityController.getYupControllerAndServiceEntities>["search"]) => {
        results: never[];
        search: string | undefined;
    };
    static updateYupControllerAndServiceEntity: (id: string, q: VovkControllerQuery<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>["q"], body: VovkControllerBody<typeof YupControllerAndServiceEntityController.updateYupControllerAndServiceEntity>) => {
        id: string;
        q: string | undefined;
        body: {
            foo: {};
        };
    };
}
