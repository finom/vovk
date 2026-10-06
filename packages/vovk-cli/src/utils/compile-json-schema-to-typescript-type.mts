import type { JSONSchema7Definition } from 'json-schema';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { compileTs } from './compile-ts.mjs';

export function compileJSONSchemaToTypeScriptType(
  schema: JSONSchema7Definition | undefined,
  typeName: string,
  components: NonNullable<OpenAPIObject['components']> = {},
  options: { dontCreateRefTypes?: boolean; direction?: 'request' | 'response' } = {}
): string {
  if (schema === undefined || schema === null) return '';
  // a boolean schema refers to nothing, so it needs no components
  if (typeof schema === 'boolean') return compileTs({ schema, name: typeName, ...options });
  return compileTs({ schema: { ...schema, components }, name: typeName, ...options });
}
