import type { VovkControllerBody, VovkControllerQuery } from 'vovk';
import type NoValidationControllerServiceAndWorkerEntityController from './NoValidationControllerServiceAndWorkerEntityController';

export default class NoValidationControllerServiceAndWorkerEntityService {
  static getNoValidationControllerServiceAndWorkerEntities = (
    q: VovkControllerQuery<
      typeof NoValidationControllerServiceAndWorkerEntityController.getNoValidationControllerServiceAndWorkerEntities
    >['q']
  ) => {
    return [{ q }];
  };

  static updateNoValidationControllerServiceAndWorkerEntity = (
    id: string,
    q: VovkControllerQuery<
      typeof NoValidationControllerServiceAndWorkerEntityController.updateNoValidationControllerServiceAndWorkerEntity
    >['q'],
    body: VovkControllerBody<
      typeof NoValidationControllerServiceAndWorkerEntityController.updateNoValidationControllerServiceAndWorkerEntity
    >
  ) => {
    return { id, q, body };
  };

  // ...
}
