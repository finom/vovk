import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import type { CombinedProps, CombinedSpec } from '../types/validation.js';

const SLOT_KEYS = ['body', 'query', 'params'] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

type JSONSchemasObject = {
  body?: VovkJSONSchemaBase;
  query?: VovkJSONSchemaBase;
  params?: VovkJSONSchemaBase;
};

/**
 * CombinedSpec from a plain JSON Schema: `jsonSchema.input/output` return it as is, `validate`
 * always throws (the value is validated during tool execution, not here).
 */
export function jsonSchemaToJSONSchemaOnlySpec({
  jsonSchema,
  subject,
}: {
  jsonSchema: VovkJSONSchemaBase;
  /** used in the validate() error message */
  subject: string;
}): CombinedSpec {
  const standard: CombinedProps = {
    version: 1,
    vendor: 'vovk',
    validate: () => {
      throw new Error(
        `Validation is not available in this context (${subject}): the schema is reconstructed from JSON Schema without the original validation library. The value is validated during tool execution instead.`
      );
    },
    jsonSchema: {
      input: () => jsonSchema as Record<string, unknown>,
      output: () => jsonSchema as Record<string, unknown>,
    },
  };

  return { '~standard': standard };
}

/**
 * Same, but combines body/query/params into one object schema
 * (same envelope as validationSchemasObjectToSingleValidationSchema).
 */
export function jsonSchemasObjectToSingleJSONSchemaOnlySpec({
  schemas,
  subject,
}: {
  schemas: JSONSchemasObject;
  subject: string;
}): CombinedSpec | undefined {
  const definedEntries = SLOT_KEYS.flatMap((key): [SlotKey, VovkJSONSchemaBase][] => {
    const schema = schemas[key];
    return schema ? [[key, schema]] : [];
  });

  if (definedEntries.length === 0) {
    return undefined;
  }

  return jsonSchemaToJSONSchemaOnlySpec({
    jsonSchema: {
      type: 'object',
      properties: Object.fromEntries(definedEntries),
      required: definedEntries.map(([key]) => key),
      additionalProperties: false,
    },
    subject,
  });
}
