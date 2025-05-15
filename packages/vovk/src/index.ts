import { createVovkApp } from './createVovkApp';
import {
  HttpStatus,
  HttpMethod,
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
} from './types';
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
} from './client';
import { HttpException } from './HttpException';
import { createDecorator } from './createDecorator';
import { JSONLinesResponse } from './JSONLinesResponse';
import { generateStaticAPI } from './utils/generateStaticAPI';
import { withValidation } from './utils/withValidation';

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
