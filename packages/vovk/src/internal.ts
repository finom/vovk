// internal exports for other vovk packages

export { resolveGeneratorConfigValues } from './core/resolve-generator-config-values.js';
export {
  applyComponentsSchemas,
  reattachMixinDefs,
} from './openapi/openapi-to-vovk-schema/apply-components-schemas.js';
export { openAPIToVovkSchema } from './openapi/openapi-to-vovk-schema/index.js';
export { vovkSchemaToOpenAPI } from './openapi/vovk-schema-to-openapi.js';
export { createCodeSamples } from './samples/create-code-samples.js';
export type {
  VovkBundleConfig,
  VovkOpenAPIMixin,
  VovkPackageJson,
  VovkReadmeConfig,
  VovkSamplesConfig,
  VovkStrictConfig,
} from './types/config.js';
export type { VovkControllerSchema, VovkMetaSchema, VovkSegmentSchema } from './types/core.js';
export { HttpMethod, VovkSchemaIdEnum } from './types/enums.js';
export type { VovkOperationObject } from './types/operation.js';
export { deepExtend } from './utils/deep-extend.js';
export { toIdentifier, toTypeName, toTypeNames } from './utils/to-identifier.js';
