import { createVovkApp } from './createVovkApp.js';
import {
  HttpStatus,
  HttpMethod,
  VovkSchemaIdEnum,
  type KnownAny,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  type VovkOutput,
  type VovkIteration,
  type VovkMetaSchema,
  type VovkSegmentSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  type VovkSchema,
  type VovkConfig,
  type VovkStrictConfig,
  type VovkValidationType,
  type VovkLLMTool,
  type VovkTypedMethod,
} from './types.js';
import {
  type VovkClient,
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkStreamAsyncIterable,
  createRPC,
  fetcher,
  createFetcher,
  progressive,
} from './client/index.js';
import { openapi, openAPIToVovkSchema, vovkSchemaToOpenAPI } from './openapi/index.js';
import { HttpException } from './HttpException.js';
import { createDecorator } from './utils/createDecorator.js';
import { JSONLinesResponse } from './JSONLinesResponse.js';
import { generateStaticAPI } from './utils/generateStaticAPI.js';
import { withValidationLibrary } from './utils/withValidationLibrary.js';
import { createStandardValidation } from './utils/createStandardValidation.js';
import { multitenant } from './utils/multitenant.js';
import { createLLMTools } from './utils/createLLMTools.js';
import { createCodeExamples } from './utils/createCodeExamples.js';

export {
  type KnownAny,
  type VovkClient,
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkStreamAsyncIterable,
  type VovkValidateOnClient,
  type VovkSegmentSchema,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkOutput,
  type VovkIteration,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkYieldType,
  type VovkReturnType,
  type VovkMetaSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  type VovkSchema,
  type VovkConfig,
  type VovkStrictConfig,
  type VovkValidationType,
  type VovkLLMTool,
  type VovkTypedMethod,
  VovkSchemaIdEnum,
  JSONLinesResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createVovkApp,
  createDecorator,
  createRPC,
  fetcher,
  createFetcher,
  generateStaticAPI,
  withValidationLibrary,
  createStandardValidation,
  multitenant,
  createLLMTools,
  createCodeExamples,
  progressive,
  openapi,
  openAPIToVovkSchema,
  vovkSchemaToOpenAPI,
};

export const { get, post, put, patch, del, head, options, prefix, initSegment } = createVovkApp();
