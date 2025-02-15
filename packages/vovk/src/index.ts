import { createVovkApp } from './createVovkApp';
import {
  HttpStatus as HttpStatus,
  HttpMethod as HttpMethod,
  type KnownAny,
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
  type VovkControllerOutput,
  type VovkSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
} from './types';
import {
  type VovkClient,
  type VovkClientOptions,
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkValidateOnClient,
  type VovkStreamAsyncIterable,
  createRPC,
} from './client';
import { HttpException } from './HttpException';
import { createDecorator } from './createDecorator';
import { StreamJSONResponse } from './StreamJSONResponse';
import { generateStaticAPI } from './utils/generateStaticAPI';
import { setHandlerValidation } from './utils/setHandlerValidation';

export {
  type KnownAny,
  type VovkClient,
  type VovkClientFetcher,
  type VovkDefaultFetcherOptions,
  type VovkStreamAsyncIterable,
  type VovkValidateOnClient,
  type VovkSchema,
  type VovkErrorResponse,
  type VovkRequest,
  type VovkControllerBody,
  type VovkControllerQuery,
  type VovkControllerParams,
  type VovkControllerYieldType,
  type VovkControllerOutput,
  type VovkBody,
  type VovkQuery,
  type VovkParams,
  type VovkYieldType,
  type VovkReturnType,
  type VovkClientOptions,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  StreamJSONResponse,
  HttpException,
  HttpStatus,
  HttpMethod,
  createVovkApp,
  createDecorator,
  createRPC,
  generateStaticAPI,
  setHandlerValidation,
};

export const { get, post, put, patch, del, head, options, prefix, initVovk } = createVovkApp();
