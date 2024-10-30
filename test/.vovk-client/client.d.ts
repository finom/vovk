// auto-generated
/* eslint-disable */
import type { clientizeController } from 'vovk/client';
import type { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import type fetcher from 'vovk/client/defaultFetcher';

import type { Controllers as Controllers1, Workers as Workers1 } from "../src/app/api/foo/client/[[...client]]/route.ts";
import type { Controllers as Controllers2, Workers as Workers2 } from "../src/app/api/workers/[[...workers]]/route.ts";

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
export const ClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["ClientControllerRPC"], Options>>;
export const StreamingControllerRPC: ReturnType<typeof clientizeController<Controllers1["StreamingControllerRPC"], Options>>;
export const StreamingGeneratorControllerRPC: ReturnType<typeof clientizeController<Controllers1["StreamingGeneratorControllerRPC"], Options>>;
export const CostomSchemaControllerRPC: ReturnType<typeof clientizeController<Controllers1["CostomSchemaControllerRPC"], Options>>;
export const WithZodClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithZodClientControllerRPC"], Options>>;
export const WithYupClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithYupClientControllerRPC"], Options>>;
export const WithDtoClientControllerRPC: ReturnType<typeof clientizeController<Controllers1["WithDtoClientControllerRPC"], Options>>;
export const MyWorkerWPC: ReturnType<typeof promisifyWorker<Workers2["MyWorkerWPC"]>>;
export const MyInnerWorkerWPC: ReturnType<typeof promisifyWorker<Workers2["MyInnerWorkerWPC"]>>;
