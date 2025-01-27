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
  type VovkWorkerSchema,
  type VovkControllerSchema,
} from './types';
import type {
  VovkClientOptions,
  VovkClientFetcher,
  VovkDefaultFetcherOptions,
  VovkValidateOnClient,
} from './client/types';
import { HttpException } from './HttpException';
import { createDecorator } from './createDecorator';
import { StreamJSONResponse } from './StreamJSONResponse';
import { worker } from './worker';
import { generateStaticAPI } from './utils/generateStaticAPI';
import { setClientValidatorsForHandler } from './utils/setClientValidatorsForHandler';

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
  type VovkWorkerSchema,
  type VovkControllerSchema,
  StreamJSONResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createVovkApp,
  createDecorator,
  worker,
  generateStaticAPI,
  setClientValidatorsForHandler,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createVovkApp();
