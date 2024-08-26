// auto-generated
/* eslint-disable */
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from 'vovk/client/defaultFetcher';
import metadata from '../.vovk-schema';

import type { Controllers as Controllers1, Workers as Workers1 } from "../src/app/api/foo/client/[[...client]]/route.ts";
import type { Controllers as Controllers2, Workers as Workers2 } from "../src/app/api/workers/[[...workers]]/route.ts";

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const prefix = 'http://localhost:3210/api';
  export const ClientController = clientizeController<Controllers1["ClientController"], Options>(metadata['foo/client'].controllers.ClientController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const ClientController5x = clientizeController<Controllers1["ClientController5x"], Options>(metadata['foo/client'].controllers.ClientController5x, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const StreamingController = clientizeController<Controllers1["StreamingController"], Options>(metadata['foo/client'].controllers.StreamingController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const StreamingGeneratorController = clientizeController<Controllers1["StreamingGeneratorController"], Options>(metadata['foo/client'].controllers.StreamingGeneratorController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const CostomMetadataController = clientizeController<Controllers1["CostomMetadataController"], Options>(metadata['foo/client'].controllers.CostomMetadataController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const WithZodClientController = clientizeController<Controllers1["WithZodClientController"], Options>(metadata['foo/client'].controllers.WithZodClientController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const WithYupClientController = clientizeController<Controllers1["WithYupClientController"], Options>(metadata['foo/client'].controllers.WithYupClientController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const WithDtoClientController = clientizeController<Controllers1["WithDtoClientController"], Options>(metadata['foo/client'].controllers.WithDtoClientController, 'foo/client', { fetcher, defaultOptions: { prefix } });
export const MyWorker = promisifyWorker<Workers2["MyWorker"]>(null, metadata['workers'].workers.MyWorker);
export const MyInnerWorker = promisifyWorker<Workers2["MyInnerWorker"]>(null, metadata['workers'].workers.MyInnerWorker);
export const MyInnerWorkerX = promisifyWorker<Workers2["MyInnerWorkerX"]>(null, metadata['workers'].workers.MyInnerWorkerX);
