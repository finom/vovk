// internal exports for  other packages and tests
export type { MCPModelOutput } from './tools/toModelOutputMCP.js';
export { deepExtend } from './utils/deepExtend.js';
export type { VovkToolDerived, VovkToolNonDerived } from './tools/types.js';
export { resolveGeneratorConfigValues } from './core/resolveGeneratorConfigValues.js';
export { createCodeSamples } from './samples/createCodeSamples.js';
export { withValidationLibrary } from './validation/withValidationLibrary.js';
export { operation } from './openapi/operation.js';
export {
  VovkSchemaIdEnum,
  type VovkErrorResponse,
  type VovkMetaSchema,
  type VovkSegmentSchema,
  type VovkControllerSchema,
  type VovkHandlerSchema,
  type VovkOutputConfig,
  type VovkReadmeConfig,
  type VovkSamplesConfig,
  type VovkPackageJson,
  type VovkOpenAPIMixin,
  type VovkOpenAPIMixinNormalized,
  type VovkStrictConfig,
  type VovkValidationType,
  type VovkTypedMethod,
  type VovkOperationObject,
  type VovkSegmentConfig,
  type VovkBundleConfig,
} from './types.js';
export { type VovkRPCModule, type VovkFetcherOptions, type VovkStreamAsyncIterable } from './client/types.js';
export { openAPIToVovkSchema } from './openapi/openAPIToVovkSchema/index.js';
export { vovkSchemaToOpenAPI } from './openapi/vovkSchemaToOpenAPI.js';
