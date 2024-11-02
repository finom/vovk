// auto-generated
/* eslint-disable */
import { clientizeController } from 'vovk/client';
import { promisifyWorker } from 'vovk/worker';
import type { VovkClientFetcher } from 'vovk/client';
import fetcher from 'vovk/client/defaultFetcher';
import schema from '../.vovk-schema';

import type { Controllers as Controllers1, Workers as Workers1 } from "../src/app/api/foo/client/[[...client]]/route.ts";
import type { Controllers as Controllers2, Workers as Workers2 } from "../src/app/api/generated/[[...vovk]]/route.ts";
import type { Controllers as Controllers3, Workers as Workers3 } from "../src/app/api/workers/[[...workers]]/route.ts";

import validateOnClient from 'vovk-zod/validateOnClient';

type Options = typeof fetcher extends VovkClientFetcher<infer U> ? U : never;
const prefix = 'http://localhost:3210/api';
export const ClientControllerRPC = clientizeController<Controllers1["ClientControllerRPC"], Options>(schema['foo/client'].controllers.ClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const StreamingControllerRPC = clientizeController<Controllers1["StreamingControllerRPC"], Options>(schema['foo/client'].controllers.StreamingControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const StreamingGeneratorControllerRPC = clientizeController<Controllers1["StreamingGeneratorControllerRPC"], Options>(schema['foo/client'].controllers.StreamingGeneratorControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const CostomSchemaControllerRPC = clientizeController<Controllers1["CostomSchemaControllerRPC"], Options>(schema['foo/client'].controllers.CostomSchemaControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const WithZodClientControllerRPC = clientizeController<Controllers1["WithZodClientControllerRPC"], Options>(schema['foo/client'].controllers.WithZodClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const WithYupClientControllerRPC = clientizeController<Controllers1["WithYupClientControllerRPC"], Options>(schema['foo/client'].controllers.WithYupClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const WithDtoClientControllerRPC = clientizeController<Controllers1["WithDtoClientControllerRPC"], Options>(schema['foo/client'].controllers.WithDtoClientControllerRPC, 'foo/client', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const NoValidationControllerOnlyEntityRPC = clientizeController<Controllers2["NoValidationControllerOnlyEntityRPC"], Options>(schema['generated'].controllers.NoValidationControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const NoValidationControllerServiceAndWorkerEntityRPC = clientizeController<Controllers2["NoValidationControllerServiceAndWorkerEntityRPC"], Options>(schema['generated'].controllers.NoValidationControllerServiceAndWorkerEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const ZodControllerOnlyEntityRPC = clientizeController<Controllers2["ZodControllerOnlyEntityRPC"], Options>(schema['generated'].controllers.ZodControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const ZodControllerAndServiceEntityRPC = clientizeController<Controllers2["ZodControllerAndServiceEntityRPC"], Options>(schema['generated'].controllers.ZodControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const YupControllerOnlyEntityRPC = clientizeController<Controllers2["YupControllerOnlyEntityRPC"], Options>(schema['generated'].controllers.YupControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const YupControllerAndServiceEntityRPC = clientizeController<Controllers2["YupControllerAndServiceEntityRPC"], Options>(schema['generated'].controllers.YupControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const DtoControllerOnlyEntityRPC = clientizeController<Controllers2["DtoControllerOnlyEntityRPC"], Options>(schema['generated'].controllers.DtoControllerOnlyEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const DtoControllerAndServiceEntityRPC = clientizeController<Controllers2["DtoControllerAndServiceEntityRPC"], Options>(schema['generated'].controllers.DtoControllerAndServiceEntityRPC, 'generated', { fetcher, validateOnClient, defaultOptions: { prefix } });
export const NoValidationControllerServiceAndWorkerEntityWPC = promisifyWorker<Workers2["NoValidationControllerServiceAndWorkerEntityWPC"]>(null, schema['generated'].workers.NoValidationControllerServiceAndWorkerEntityWPC);
export const MyWorkerWPC = promisifyWorker<Workers3["MyWorkerWPC"]>(null, schema['workers'].workers.MyWorkerWPC);
export const MyInnerWorkerWPC = promisifyWorker<Workers3["MyInnerWorkerWPC"]>(null, schema['workers'].workers.MyInnerWorkerWPC);
