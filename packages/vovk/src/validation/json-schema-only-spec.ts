import type { VovkJSONSchemaBase } from '../types/json-schema.js';
import type { StandardSchemaV1 } from '../types/standard-schema.js';
import type { CombinedProps, CombinedSpec } from '../types/validation.js';

const SLOT_KEYS = ['body', 'query', 'params'] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

type JSONSchemasObject = {
  body?: VovkJSONSchemaBase;
  query?: VovkJSONSchemaBase;
  params?: VovkJSONSchemaBase;
};

function makeSpec(jsonSchema: VovkJSONSchemaBase, validate: CombinedProps['validate']): CombinedSpec {
  return {
    '~standard': {
      version: 1,
      vendor: 'vovk',
      validate,
      jsonSchema: {
        input: () => jsonSchema as Record<string, unknown>,
        output: () => jsonSchema as Record<string, unknown>,
      },
    },
  };
}

// CombinedSpec from a plain JSON Schema: jsonSchema.input/output return it as is, validate always
// passes since the real validation happens during tool execution, not here
export function jsonSchemaToJSONSchemaOnlySpec({ jsonSchema }: { jsonSchema: VovkJSONSchemaBase }): CombinedSpec {
  return makeSpec(jsonSchema, (value) => ({ value }));
}

// Same, but combines body/query/params into one object schema (same envelope as
// validationSchemasObjectToSingleValidationSchema); validate checks the envelope only
// (object shape, required slots, unknown keys) and lets slot contents pass
export function jsonSchemasObjectToSingleJSONSchemaOnlySpec({
  schemas,
}: {
  schemas: JSONSchemasObject;
}): CombinedSpec | undefined {
  const definedEntries = SLOT_KEYS.flatMap((key): [SlotKey, VovkJSONSchemaBase][] => {
    const schema = schemas[key];
    return schema ? [[key, schema]] : [];
  });

  if (definedEntries.length === 0) {
    return undefined;
  }

  const definedSlots = definedEntries.map(([key]) => key);
  const definedSlotSet = new Set<string>(definedSlots);

  const validate = (input: unknown): StandardSchemaV1.Result<unknown> => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return { issues: [{ message: 'Expected object', path: [] }] };
    }

    const issues: StandardSchemaV1.Issue[] = [];
    const inputRecord = input as Record<string, unknown>;

    for (const slot of definedSlots) {
      if (!(slot in inputRecord)) {
        issues.push({ message: 'Required', path: [{ key: slot }] });
      }
    }

    for (const key of Object.keys(inputRecord)) {
      if (!definedSlotSet.has(key)) {
        issues.push({ message: 'Unexpected key', path: [{ key }] });
      }
    }

    return issues.length > 0 ? { issues } : { value: input };
  };

  return makeSpec(
    {
      type: 'object',
      properties: Object.fromEntries(definedEntries),
      required: definedSlots,
      additionalProperties: false,
    },
    validate
  );
}
