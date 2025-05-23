import { createVovkApp } from './createVovkApp.js';
import {
  HttpStatus,
  HttpMethod,
  VovkSchemaIdEnum, // TODO: not documented
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
} from './types.js';
import {
  type VovkClient,
  type VovkClientOptions,
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkStreamAsyncIterable,
  createRPC,
  fetcher,
  createFetcher,
} from './client/index.js';
import { HttpException } from './HttpException.js';
import { createDecorator } from './createDecorator.js';
import { JSONLinesResponse } from './JSONLinesResponse.js';
import { generateStaticAPI } from './utils/generateStaticAPI.js';
import { withValidation } from './utils/withValidation.js';

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
  type VovkClientOptions,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  type VovkSchema,
  type VovkConfig,
  type VovkStrictConfig,
  type VovkValidationType,
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
  withValidation,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createVovkApp();
