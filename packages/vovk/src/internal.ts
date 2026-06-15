// internal exports for other packages and tests

export { readableStreamToAsyncIterable } from './client/default-stream-handler.js';
export { resolveGeneratorConfigValues } from './core/resolve-generator-config-values.js';
export {
  applyComponentsSchemas,
  reattachMixinDefs,
} from './openapi/openapi-to-vovk-schema/apply-components-schemas.js';
export { openAPIToVovkSchema } from './openapi/openapi-to-vovk-schema/index.js';
export { operation } from './openapi/operation.js';
export { vovkSchemaToOpenAPI } from './openapi/vovk-schema-to-openapi.js';
export { createCodeSamples } from './samples/create-code-samples.js';
export type { MCPModelOutput } from './tools/to-model-output-mcp.js';
export type { VovkFetcherOptions, VovkRPCModule, VovkStreamAsyncIterable } from './types/client.js';
export type {
  VovkBundleConfig,
  VovkOpenAPIMixin,
  VovkOpenAPIMixinNormalized,
  VovkOutputConfig,
  VovkPackageJson,
  VovkReadmeConfig,
  VovkSamplesConfig,
  VovkSegmentConfig,
  VovkStrictConfig,
} from './types/config.js';
export type {
  VovkControllerSchema,
  VovkErrorResponse,
  VovkHandlerSchema,
  VovkMetaSchema,
  VovkSegmentSchema,
  VovkValidationType,
} from './types/core.js';
export { VovkSchemaIdEnum } from './types/enums.js';
export type { VovkOperationObject } from './types/operation.js';
export type { IsAny, IsNotAny } from './types/utils.js';
export type { VovkTypedProcedure } from './types/validation.js';
export { deepExtend } from './utils/deep-extend.js';
export { validationSchemasObjectToSingleValidationSchema } from './validation/validation-schemas-object-to-single-validation-schema.js';
export { withValidationLibrary } from './validation/with-validation-library.js';
