import { KnownAny } from './utils.js';

type Type = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'integer';

/**
 * Base JSON Schema type used in Vovk.ts for validation and code generation.
 * @see https://vovk.dev/schema
 */
export type VovkJSONSchemaBase = {
  $schema?: 'https://json-schema.org/draft/2020-12/schema' | 'http://json-schema.org/draft-07/schema#';
  type?: Type | Type[];
  format?: string;
  pattern?: string;
  $ref?: string;
  items?: boolean | VovkJSONSchemaBase;
  prefixItems?: VovkJSONSchemaBase[];
  additionalItems?: boolean | VovkJSONSchemaBase;
  enum?: KnownAny[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minItems?: number;
  maxItems?: number;
  title?: string;
  description?: string;
  properties?: { [key: string]: VovkJSONSchemaBase };
  required?: string[];
  examples?: KnownAny[];
  not?: VovkJSONSchemaBase;
  // support both $defs and definitions
  $defs?: { [key: string]: VovkJSONSchemaBase };
  definitions?: { [key: string]: VovkJSONSchemaBase };
  additionalProperties?: boolean | VovkJSONSchemaBase;
  anyOf?: VovkJSONSchemaBase[];
  oneOf?: VovkJSONSchemaBase[];
  allOf?: VovkJSONSchemaBase[];
  // older schema
  const?: KnownAny;
  example?: KnownAny;
  // binary
  contentEncoding?: string;
  contentMediaType?: string;
  minLength?: number;
  maxLength?: number;
  // 'x-foo' extensions
  [key: `x-${string}`]: KnownAny;
};
