// internal exports for other packages and tests
export { deepExtend } from './utils/deepExtend.js';
export { resolveGeneratorConfigValues } from './core/resolveGeneratorConfigValues.js';
export { createCodeSamples } from './samples/createCodeSamples.js';
export { withValidationLibrary } from './validation/withValidationLibrary.js';
export { operation } from './openapi/operation.js';
export { openAPIToVovkSchema } from './openapi/openAPIToVovkSchema/index.js';
export { vovkSchemaToOpenAPI } from './openapi/vovkSchemaToOpenAPI.js';

export { VovkSchemaIdEnum } from './types/enums.js';
export type { VovkToolDerived, VovkToolNonDerived } from './types/tools.js';
export type { MCPModelOutput } from './tools/toModelOutputMCP.js';
export type {
  VovkErrorResponse,
  VovkMetaSchema,
  VovkSegmentSchema,
  VovkControllerSchema,
  VovkHandlerSchema,
  VovkValidationType,
} from './types/core.js';
export type { VovkTypedProcedure } from './types/validation.js';
export type {
  VovkOutputConfig,
  VovkReadmeConfig,
  VovkSamplesConfig,
  VovkPackageJson,
  VovkOpenAPIMixin,
  VovkOpenAPIMixinNormalized,
  VovkStrictConfig,
  VovkBundleConfig,
  VovkSegmentConfig,
} from './types/config.js';
export type { VovkOperationObject } from './types/operation.js';
export type { VovkRPCModule, VovkFetcherOptions, VovkStreamAsyncIterable } from './types/client.js';
