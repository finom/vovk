import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { VovkPackageJson, VovkStrictConfig } from './config.js';
import type { HttpStatus, VovkSchemaIdEnum } from './enums.js';
import type { VovkJSONSchemaBase } from './json-schema.js';
import type { VovkOperationObject } from './operation.js';
import type { VovkRequest } from './request.js';
import type { KnownAny, RequireFields, StaticClass } from './utils.js';
import type { Responder } from '../core/JSONLinesResponder.js';

/**
 * Schema for an individual handler, available as MyRPC.myHandler.schema and MyController.myHandler.schema
 */
export type VovkHandlerSchema = {
  path: string;
  httpMethod: string; // HttpMethod type makes JSON incompatible with VovkHandlerSchema type
  validation?: {
    query?: VovkJSONSchemaBase;
    body?: VovkJSONSchemaBase;
    params?: VovkJSONSchemaBase;
    output?: VovkJSONSchemaBase;
    iteration?: VovkJSONSchemaBase;
  };
  operationObject?: VovkOperationObject;
  misc?: Record<string, unknown>;
};

/**
 * Represents the schema of a controller
 */
export type VovkControllerSchema = {
  rpcModuleName: string;
  originalControllerName?: string;
  prefix?: string;
  forceApiRoot?: string;
  handlers: { [key: string]: VovkHandlerSchema };
};

/**
 * Represents the schema of a segment
 */
export type VovkSegmentSchema = {
  $schema: typeof VovkSchemaIdEnum.SEGMENT | (string & {});
  emitSchema: boolean;
  segmentName: string;
  segmentType: 'segment' | 'mixin' | (string & {});
  forceApiRoot?: string;
  controllers: { [key: string]: VovkControllerSchema };
  meta?: {
    openAPIObject?: Partial<Omit<OpenAPIObject, 'paths'>>;
    package?: VovkPackageJson;
  };
};

/**
 * Represents the meta schema
 */
export type VovkMetaSchema = {
  $schema: typeof VovkSchemaIdEnum.META | (string & {});
  config: RequireFields<Partial<VovkStrictConfig>, '$schema'>;
  openAPIObject?: Partial<OpenAPIObject>;
};

/**
 * Represents the full schema of composed client or a segment in segmented client.
 * @see https://vovk.dev/schema
 */
export type VovkSchema = {
  $schema: typeof VovkSchemaIdEnum.SCHEMA | (string & {});
  segments: { [key: string]: VovkSegmentSchema };
  meta?: VovkMetaSchema;
};

/**
 * The shape of error responses
 */
export type VovkErrorResponse = {
  cause?: unknown;
  statusCode: HttpStatus;
  message: string;
  isError: true;
};

export type StreamAbortMessage = {
  isError: true;
  reason: KnownAny;
};

export type VovkControllerInternal = {
  _segmentName: string;
  _rpcModuleName?: VovkControllerSchema['rpcModuleName'];
  _prefix?: VovkControllerSchema['prefix'];
  _handlers: VovkControllerSchema['handlers'];
  _handlersMetadata?: Record<string, { staticParams?: Record<string, string>[] }>;
  _onError?: (err: Error, req: VovkRequest) => void | Promise<void>;
  _onSuccess?: (resp: unknown, req: VovkRequest) => void | Promise<void>;
  _onBefore?: (req: VovkRequest) => void | Promise<void>;
};

export type VovkController = StaticClass &
  VovkControllerInternal & {
    [key: string]: unknown;
  };

export type DecoratorOptions = {
  cors?: boolean;
  headers?: Record<string, string>;
  staticParams?: Record<string, string>[];
  before?: (this: VovkController, req: VovkRequest) => unknown;
};

export type RouteHandler = ((
  req: VovkRequest,
  params: Record<string, string>
) => Response | Promise<Response> | Responder | Promise<Responder> | Iterable<unknown> | AsyncIterable<unknown>) & {
  _options?: DecoratorOptions;
};

export type ControllerStaticMethod<
  REQ extends VovkRequest = VovkRequest,
  TParams extends { [key: string]: string } = KnownAny,
> = ((req: REQ, params: TParams) => unknown) & {
  _controller?: VovkController;
};

export type VovkValidationType = 'body' | 'query' | 'params' | 'output' | 'iteration' | 'tool-input';
