import CommonController from '../../../../../client/CommonController';
import StreamingController from '../../../../../client/StreamingController';
import StreamingGeneratorController from '../../../../../client/StreamingGeneratorController';
import CustomSchemaController from '../../../../../client/CustomSchemaController';
import WithZodClientController from '../../../../../client/WithZodClientController';
import WithYupClientController from '../../../../../client/WithYupClientController';
import WithDtoClientController from '../../../../../client/WithDtoClientController';
import OpenApiController from '../../../../../client/OpenApiController';
declare const controllers: {
    CommonControllerRPC: typeof CommonController;
    StreamingControllerRPC: typeof StreamingController;
    StreamingGeneratorControllerRPC: typeof StreamingGeneratorController;
    CustomSchemaControllerRPC: typeof CustomSchemaController;
    WithZodClientControllerRPC: typeof WithZodClientController;
    WithYupClientControllerRPC: typeof WithYupClientController;
    WithDtoClientControllerRPC: typeof WithDtoClientController;
    OpenApiControllerRPC: typeof OpenApiController;
};
export type Controllers = typeof controllers;
export declare const GET: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, POST: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, PATCH: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, PUT: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, HEAD: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, OPTIONS: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>, DELETE: (req: import("next/server").NextRequest, data: {
    params: Promise<Record<string, string[]>>;
}) => Promise<Response>;
export {};
