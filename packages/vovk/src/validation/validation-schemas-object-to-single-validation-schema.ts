import type { StandardJSONSchemaV1, StandardSchemaV1 } from '../types/standard-schema.js';
import type { CombinedProps, CombinedSpec } from '../types/validation.js';
import { toEnvelopeJSONSchema } from './envelope-json-schema.js';

const SLOT_KEYS = ['body', 'query', 'params'] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

type SchemasObject = {
  body?: CombinedSpec;
  query?: CombinedSpec;
  params?: CombinedSpec;
};

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return typeof value === 'object' && value !== null && typeof (value as { then?: unknown }).then === 'function';
}

function prefixIssues(issues: ReadonlyArray<StandardSchemaV1.Issue>, slot: SlotKey): StandardSchemaV1.Issue[] {
  return issues.map((issue) => ({
    message: issue.message,
    path: [{ key: slot }, ...(issue.path ?? [])],
  }));
}

// checks the envelope here and each slot with its own schema; a valid input comes back unchanged, as the AI SDK
// hands it to execute, which validates and transforms it once
export function validationSchemasObjectToSingleValidationSchema<TSchemas extends SchemasObject>(
  schemas: TSchemas
): CombinedSpec & TSchemas {
  const definedEntries = SLOT_KEYS.flatMap((key): [SlotKey, CombinedSpec][] => {
    const schema = schemas[key];
    return schema ? [[key, schema]] : [];
  });
  const definedSlots = definedEntries.map(([key]) => key);
  const definedSlotSet = new Set<string>(definedSlots);

  const validate = (input: unknown): StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>> => {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      return { issues: [{ message: 'Expected object', path: [] }] };
    }

    const topLevelIssues: StandardSchemaV1.Issue[] = [];
    const inputRecord = input as Record<string, unknown>;

    for (const slot of definedSlots) {
      if (!(slot in inputRecord)) {
        topLevelIssues.push({ message: 'Required', path: [{ key: slot }] });
      }
    }

    for (const key of Object.keys(inputRecord)) {
      if (!definedSlotSet.has(key)) {
        topLevelIssues.push({ message: 'Unexpected key', path: [{ key }] });
      }
    }

    type SlotPending = {
      slot: SlotKey;
      result: StandardSchemaV1.Result<unknown> | Promise<StandardSchemaV1.Result<unknown>>;
    };
    const pending: SlotPending[] = [];
    for (const [slot, schema] of definedEntries) {
      if (slot in inputRecord) {
        pending.push({ slot, result: schema['~standard'].validate(inputRecord[slot]) });
      }
    }

    const combine = (
      resolved: { slot: SlotKey; result: StandardSchemaV1.Result<unknown> }[]
    ): StandardSchemaV1.Result<unknown> => {
      const issues: StandardSchemaV1.Issue[] = [...topLevelIssues];
      for (const { slot, result } of resolved) {
        if (result.issues?.length) issues.push(...prefixIssues(result.issues, slot));
      }
      return issues.length > 0 ? { issues } : { value: input };
    };

    if (pending.some(({ result }) => isThenable(result))) {
      return Promise.all(pending.map(async ({ slot, result }) => ({ slot, result: await result }))).then(combine);
    }

    return combine(pending as { slot: SlotKey; result: StandardSchemaV1.Result<unknown> }[]);
  };

  const buildJSONSchema = (options: StandardJSONSchemaV1.Options) =>
    toEnvelopeJSONSchema(
      definedEntries.map(([slot, schema]): [SlotKey, unknown] => [
        slot,
        schema['~standard'].jsonSchema?.input(options) ?? {},
      ])
    );

  const standard: CombinedProps = {
    version: 1,
    vendor: 'vovk',
    validate,
    // the output is the input itself, see validate
    jsonSchema: { input: buildJSONSchema, output: buildJSONSchema },
  };

  const result: SchemasObject & { '~standard': CombinedProps } = { '~standard': standard };
  if (schemas.body !== undefined) result.body = schemas.body;
  if (schemas.query !== undefined) result.query = schemas.query;
  if (schemas.params !== undefined) result.params = schemas.params;

  return result as CombinedSpec & TSchemas;
}
