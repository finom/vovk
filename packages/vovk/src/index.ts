import { createVovkApp } from './createVovkApp';
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
  type VovkSegmentSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  type VovkSchema,
  type VovkConfig,
  type VovkStrictConfig,
  type VovkValidationType,
  type VovkLLMTool,
  type VovkTypedMethod,
} from './types';
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
} from './client/index';
import { openapi, openAPIToVovkSchema, vovkSchemaToOpenAPI } from './openapi/index';
import { HttpException } from './HttpException';
import { createDecorator } from './utils/createDecorator';
import { JSONLinesResponse } from './JSONLinesResponse';
import { generateStaticAPI } from './utils/generateStaticAPI';
import { withValidationLibrary } from './utils/withValidationLibrary';
import { withStandard } from './utils/withStandard';
import { multitenant } from './utils/multitenant';
import { createLLMTools } from './utils/createLLMTools';
import { createCodeExamples } from './utils/createCodeExamples';

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
  withStandard,
  multitenant,
  createLLMTools,
  createCodeExamples,
  progressive,
  openapi,
  openAPIToVovkSchema,
  vovkSchemaToOpenAPI,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createVovkApp();
