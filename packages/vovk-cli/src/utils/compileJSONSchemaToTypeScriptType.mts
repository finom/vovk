import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { JSONSchema7 } from 'json-schema';
import { compileTs } from './compileTs.mjs';

export function compileJSONSchemaToTypeScriptType(
  schema: JSONSchema7,
  typeName: string,
  components: NonNullable<OpenAPIObject['components']> = {},
  options: { dontCreateRefTypes?: boolean } = {}
): string {
  if (!schema) return '';
  if ('tsType' in schema && typeof schema.tsType === 'string') return `export type ${typeName} = ${schema.tsType};\n`;
  const tsType = compileTs({ schema: { ...schema, components }, name: typeName, ...options });

  return tsType;
}
