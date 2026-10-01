import {
  decodeJSONPointerToken,
  encodeJSONPointerToken,
  isJSONObject,
  mapJSONSchemaRefs,
} from '../utils/map-json-schema-refs.js';

const DEFS_KEYWORDS = ['$defs', 'definitions'] as const;
type DefsKeyword = (typeof DEFS_KEYWORDS)[number];

const isLocalRef = (ref: string) => ref === '#' || ref.startsWith('#/');

/**
 * Builds the `{ body, query, params }` object schema of a tool input. A slot's refs point at the slot's own root,
 * so its `$defs` (or `definitions`) move to the envelope root, renamed when two slots use the same name, and a slot
 * that refers to its own root moves to `$defs` too.
 */
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
      const [keyword, token] = ref.split('/').slice(1);
      const name = token === undefined ? null : decodeJSONPointerToken(token);
      if (
        (keyword !== '$defs' && keyword !== 'definitions') ||
        name === null ||
        !Object.hasOwn(slotDefsByKeyword[keyword], name)
      ) {
        return null;
      }
      return { keyword, name, token, rest: ref.slice(`#/${keyword}/${token}`.length) };
    };

    let refersToRoot = false;
    mapJSONSchemaRefs(schema, (ref) => {
      if (isLocalRef(ref) && !findDef(ref)) refersToRoot = true;
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
      if (!isLocalRef(ref)) return ref;
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
