// internal exports for  other packages and tests
export type { MCPModelOutput } from './tools/toModelOutputMCP';
export { deepExtend } from './utils/deepExtend';
export type { VovkToolDerived, VovkToolNonDerived } from './tools/types';
export { resolveGeneratorConfigValues } from './core/resolveGeneratorConfigValues';
export { createCodeSamples } from './samples/createCodeSamples';
export { withValidationLibrary } from './validation/withValidationLibrary';
export { operation } from './openapi/operation';
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
} from './types';
export { type VovkRPCModule, type VovkFetcherOptions, type VovkStreamAsyncIterable } from './client/types';
export { openAPIToVovkSchema } from './openapi/openAPIToVovkSchema';
export { vovkSchemaToOpenAPI } from './openapi/vovkSchemaToOpenAPI';
