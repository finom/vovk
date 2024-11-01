import { worker } from 'vovk';

@worker()
export default class NoValidationControllerServiceAndWorkerEntityWorker {
  static heavyComputation = () => {
    return 'Hello, World';
  };

  static heavyComputationGenerator = function* () {
    for (const str of ['Hello', 'World'] as const) {
      yield str;
    }
  };
}
