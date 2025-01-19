// auto-generated
/* eslint-disable */
import type { clientizeController, VovkClientFetcher } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type fetcher from 'vovk/client/defaultFetcher';


    import type { Controllers as Controllers0, Workers as Workers0 } from "../src/app/api/[[...vovk]]/route.ts";

    import type { Controllers as Controllers1, Workers as Workers1 } from "../src/app/api/foo/client/[[...client]]/route.ts";

    import type { Controllers as Controllers2, Workers as Workers2 } from "../src/app/api/generated/[[...vovk]]/route.ts";

    import type { Controllers as Controllers3, Workers as Workers3 } from "../src/app/api/workers/[[...workers]]/route.ts";


type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;


  
    export const ClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["ClientControllerRPC"], Options>>;
  
    export const StreamingControllerRPC: ReturnType<typeof clientizeController<Controllers1["StreamingControllerRPC"], Options>>;
  
    export const StreamingGeneratorControllerRPC: ReturnType<typeof clientizeController<Controllers1["StreamingGeneratorControllerRPC"], Options>>;
  
    export const CostomSchemaControllerRPC: ReturnType<typeof clientizeController<Controllers1["CostomSchemaControllerRPC"], Options>>;
  
    export const WithZodClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithZodClientControllerRPC"], Options>>;
  
    export const WithYupClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithYupClientControllerRPC"], Options>>;
  
    export const WithDtoClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithDtoClientControllerRPC"], Options>>;
  
  

  
    export const NoValidationControllerOnlyEntityRPC: ReturnType<typeof clientizeController<Controllers2["NoValidationControllerOnlyEntityRPC"], Options>>;
  
    export const NoValidationControllerServiceAndWorkerEntityRPC: ReturnType<typeof clientizeController<Controllers2["NoValidationControllerServiceAndWorkerEntityRPC"], Options>>;
  
    export const ZodControllerOnlyEntityRPC: ReturnType<typeof clientizeController<Controllers2["ZodControllerOnlyEntityRPC"], Options>>;
  
    export const ZodControllerAndServiceEntityRPC: ReturnType<typeof clientizeController<Controllers2["ZodControllerAndServiceEntityRPC"], Options>>;
  
    export const YupControllerOnlyEntityRPC: ReturnType<typeof clientizeController<Controllers2["YupControllerOnlyEntityRPC"], Options>>;
  
    export const YupControllerAndServiceEntityRPC: ReturnType<typeof clientizeController<Controllers2["YupControllerAndServiceEntityRPC"], Options>>;
  
    export const DtoControllerOnlyEntityRPC: ReturnType<typeof clientizeController<Controllers2["DtoControllerOnlyEntityRPC"], Options>>;
  
    export const DtoControllerAndServiceEntityRPC: ReturnType<typeof clientizeController<Controllers2["DtoControllerAndServiceEntityRPC"], Options>>;
  
  
    export const NoValidationControllerServiceAndWorkerEntityWPC: ReturnType<typeof promisifyWorker<Workers2["NoValidationControllerServiceAndWorkerEntityWPC"]>>;
  

  
  
    export const MyWorkerWPC: ReturnType<typeof promisifyWorker<Workers3["MyWorkerWPC"]>>;
  
    export const MyInnerWorkerWPC: ReturnType<typeof promisifyWorker<Workers3["MyInnerWorkerWPC"]>>;
  

