import {
  encodeJSONPointerToken,
  isJSONObject,
  isLocalJSONSchemaRef,
  mapJSONSchemaRefs,
  parseDefinitionRef,
} from '../utils/map-json-schema-refs.js';

const DEFS_KEYWORDS = ['$defs', 'definitions'] as const;
type DefsKeyword = (typeof DEFS_KEYWORDS)[number];

// the { body, query, params } schema of a tool input: each slot's $defs and definitions move to the root $defs,
// renamed when two slots use one name, and a slot that refers to its own root moves there too
export function toEnvelopeJSONSchema(slots: [slot: string, schema: unknown][]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const defs = new Map<string, unknown>();
  const reserve = (name: string) => {
    let unique = name;
    for (let i = 2; defs.has(unique); i++) unique = `${name}_${i}`;
    defs.set(unique, null);
    return unique;
  };

  for (const [slot, schema] of slots) {
    // a slot with its own `$id` is a separate resource, its refs already resolve against it
    if (!isJSONObject(schema) || typeof schema.$id === 'string') {
      properties[slot] = schema;
      continue;
    }

    const { $defs: slotDefs, definitions: slotDefinitions, ...root } = schema;
    const slotDefsByKeyword: Record<DefsKeyword, Record<string, unknown>> = {
      $defs: isJSONObject(slotDefs) ? slotDefs : {},
      definitions: isJSONObject(slotDefinitions) ? slotDefinitions : {},
    };
    const findDef = (ref: string) => {
      const def = parseDefinitionRef(ref);
      return def && Object.hasOwn(slotDefsByKeyword[def.keyword], def.name) ? def : null;
    };

    let refersToRoot = false;
    mapJSONSchemaRefs(schema, (ref) => {
      if (isLocalJSONSchemaRef(ref) && !findDef(ref)) refersToRoot = true;
      return ref;
    });

    const rootName = refersToRoot ? reserve(slot) : null;
    const rootRef = `#/$defs/${encodeJSONPointerToken(rootName ?? slot)}`;
    const newNames = new Map<string, string>();
    for (const keyword of DEFS_KEYWORDS) {
      for (const name of Object.keys(slotDefsByKeyword[keyword])) {
        newNames.set(`${keyword}/${name}`, reserve(defs.has(name) ? `${slot}_${name}` : name));
      }
    }

    const rewrite = (ref: string) => {
      if (!isLocalJSONSchemaRef(ref)) return ref;
      const def = findDef(ref);
      // a local ref outside the slot's defs exists only when the slot refers to its own root
      if (!def) return `${rootRef}${ref.slice(1)}`;
      const newName = newNames.get(`${def.keyword}/${def.name}`) ?? def.name;
      return `#/$defs/${newName === def.name ? def.token : encodeJSONPointerToken(newName)}${def.rest}`;
    };

    for (const keyword of DEFS_KEYWORDS) {
      for (const [name, def] of Object.entries(slotDefsByKeyword[keyword])) {
        defs.set(newNames.get(`${keyword}/${name}`) ?? name, mapJSONSchemaRefs(def, rewrite));
      }
    }

    if (rootName !== null) {
      defs.set(rootName, mapJSONSchemaRefs(root, rewrite));
      properties[slot] = { $ref: rootRef };
    } else {
      properties[slot] = mapJSONSchemaRefs(root, rewrite);
    }
  }

  return {
    type: 'object',
    properties,
    required: slots.map(([slot]) => slot),
    additionalProperties: false,
    ...(defs.size ? { $defs: Object.fromEntries(defs) } : {}),
  };
}
