import { createVovkApp } from './createVovkApp';
import {
  HttpStatus as HttpStatus,
  HttpMethod as HttpMethod,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkReturnType,
  type VovkYieldType,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerYieldType,
  type VovkSchema,
} from './types';
import type {
  VovkClientOptions as VovkClientOptions,
  VovkClientFetcher as VovkClientFetcher,
  VovkDefaultFetcherOptions as VovkDefaultFetcherOptions,
  VovkValidateOnClient as VovkValidateOnClient,
} from './client/types';
import { HttpException } from './HttpException';
import { createDecorator } from './createDecorator';
import { StreamJSONResponse } from './StreamJSONResponse';
import { worker } from './worker';
import { generateStaticAPI } from './utils/generateStaticAPI';

export {
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkSchema,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerYieldType,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkYieldType,
  type VovkReturnType,
  type VovkClientOptions,
  StreamJSONResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createVovkApp,
  createDecorator,
  worker,
  generateStaticAPI,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createVovkApp();
