// auto-generated
/* eslint-disable */
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from 'vovk/client/defaultFetcher';

import type { Controllers as Controllers1, Workers as Workers1 } from "../src/app/api/foo/client/[[...client]]/route.ts";
import type { Controllers as Controllers2, Workers as Workers2 } from "../src/app/api/workers/[[...workers]]/route.ts";

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
  export const ClientController: ReturnType<typeof clientizeController<Controllers1["ClientController"], Options>>;
export const ClientController5x: ReturnType<typeof clientizeController<Controllers1["ClientController5x"], Options>>;
export const StreamingController: ReturnType<typeof clientizeController<Controllers1["StreamingController"], Options>>;
export const StreamingGeneratorController: ReturnType<typeof clientizeController<Controllers1["StreamingGeneratorController"], Options>>;
export const CostomSchemaController: ReturnType<typeof clientizeController<Controllers1["CostomSchemaController"], Options>>;
export const WithZodClientController: ReturnType<typeof clientizeController<Controllers1["WithZodClientController"], Options>>;
export const WithYupClientController: ReturnType<typeof clientizeController<Controllers1["WithYupClientController"], Options>>;
export const WithDtoClientController: ReturnType<typeof clientizeController<Controllers1["WithDtoClientController"], Options>>;
export const MyWorker: ReturnType<typeof promisifyWorker<Workers2["MyWorker"]>>;
export const MyInnerWorker: ReturnType<typeof promisifyWorker<Workers2["MyInnerWorker"]>>;
export const MyInnerWorkerX: ReturnType<typeof promisifyWorker<Workers2["MyInnerWorkerX"]>>;
