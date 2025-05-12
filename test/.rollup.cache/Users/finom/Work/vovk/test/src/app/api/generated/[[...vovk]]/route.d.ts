import NoValidationControllerOnlyEntityController from '../../../../modules/generated/noValidationControllerOnlyEntity/NoValidationControllerOnlyEntityController';
import NoValidationControllerAndServiceEntityController from '../../../../modules/generated/noValidationControllerAndServiceEntity/NoValidationControllerAndServiceEntityController';
import ZodControllerOnlyEntityController from '../../../../modules/generated/zodControllerOnlyEntity/ZodControllerOnlyEntityController';
import ZodControllerAndServiceEntityController from '../../../../modules/generated/zodControllerAndServiceEntity/ZodControllerAndServiceEntityController';
import YupControllerOnlyEntityController from '../../../../modules/generated/yupControllerOnlyEntity/YupControllerOnlyEntityController';
import YupControllerAndServiceEntityController from '../../../../modules/generated/yupControllerAndServiceEntity/YupControllerAndServiceEntityController';
import DtoControllerOnlyEntityController from '../../../../modules/generated/dtoControllerOnlyEntity/DtoControllerOnlyEntityController';
import DtoControllerAndServiceEntityController from '../../../../modules/generated/dtoControllerAndServiceEntity/DtoControllerAndServiceEntityController';
export declare const runtime = "edge";
declare const controllers: {
    NoValidationControllerOnlyEntityRPC: typeof NoValidationControllerOnlyEntityController;
    NoValidationControllerAndServiceEntityRPC: typeof NoValidationControllerAndServiceEntityController;
    ZodControllerOnlyEntityRPC: typeof ZodControllerOnlyEntityController;
    ZodControllerAndServiceEntityRPC: typeof ZodControllerAndServiceEntityController;
    YupControllerOnlyEntityRPC: typeof YupControllerOnlyEntityController;
    YupControllerAndServiceEntityRPC: typeof YupControllerAndServiceEntityController;
    DtoControllerOnlyEntityRPC: typeof DtoControllerOnlyEntityController;
    DtoControllerAndServiceEntityRPC: typeof DtoControllerAndServiceEntityController;
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
