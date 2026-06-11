// internal exports for other packages and tests
export { deepExtend } from './utils/deep-extend.js';
export { resolveGeneratorConfigValues } from './core/resolve-generator-config-values.js';
export { createCodeSamples } from './samples/create-code-samples.js';
export { withValidationLibrary } from './validation/with-validation-library.js';
export { validationSchemasObjectToSingleValidationSchema } from './validation/validation-schemas-object-to-single-validation-schema.js';
export { operation } from './openapi/operation.js';
export { openAPIToVovkSchema } from './openapi/openapi-to-vovk-schema/index.js';
export {
  applyComponentsSchemas,
  reattachMixinDefs,
} from './openapi/openapi-to-vovk-schema/apply-components-schemas.js';
export { vovkSchemaToOpenAPI } from './openapi/vovk-schema-to-openapi.js';
export { readableStreamToAsyncIterable } from './client/default-stream-handler.js';

export { VovkSchemaIdEnum } from './types/enums.js';
export type { MCPModelOutput } from './tools/to-model-output-mcp.js';
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
export type { IsAny, IsNotAny } from './types/utils.js';
