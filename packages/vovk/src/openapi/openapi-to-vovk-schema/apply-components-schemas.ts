import type { ComponentsObject } from 'openapi3-ts/oas31';
import type { VovkJSONSchemaBase } from '../../types/json-schema.js';
import { camelCase } from '../../utils/camel-case.js';
import { upperFirst } from '../../utils/upper-first.js';

// fast clone JSON object while ignoring Date, RegExp, and Function types
function cloneJSON(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cloneJSON);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date || value instanceof RegExp || typeof value === 'function') continue;
    result[key] = cloneJSON(value);
  }
  return result;
}

export function applyComponentsSchemas(
  schema: VovkJSONSchemaBase,
  components: ComponentsObject['schemas'],
  mixinName: string,
  // true (default): embed the ref closure in `$defs`, self-contained (AJV + Rust);
  // false: keep `#/components/schemas/X` refs, no `$defs` (avoids the per-handler dup that overflows big specs)
  emitDefs = true
): VovkJSONSchemaBase | VovkJSONSchemaBase[] {
  const key = 'components/schemas';
  if (!components || !Object.keys(components).length) return schema;

  // Create a deep copy of the schema
  const result = cloneJSON(schema) as VovkJSONSchemaBase;

  // Initialize $defs only when embedding (self-contained slots).
  if (emitDefs) {
    result.$defs = result.$defs || {};
  }

  // Set to track components we've added to $defs
  const addedComponents = new Set<string>();

  // Process a schema object and replace $refs
  function processSchema(obj: VovkJSONSchemaBase): VovkJSONSchemaBase | VovkJSONSchemaBase[] {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle arrays first - they don't have $ref
    if (Array.isArray(obj)) {
      return obj.map((item) => processSchema(item)) as VovkJSONSchemaBase[];
    }

    // Now we know it's an object, so we can safely access $ref
    const newObj = { ...obj };
    const $ref = newObj.$ref;

    if ($ref && typeof $ref === 'string' && $ref.startsWith(`#/${key}/`)) {
      const componentName = $ref.replace(`#/${key}/`, '');
      if (components?.[componentName]) {
        // Set `x-tsType` so TS resolves the ref without local `$defs`.
        newObj['x-tsType'] ??= `Mixins.${upperFirst(camelCase(mixinName))}.${upperFirst(camelCase(componentName))}`;

        if (emitDefs) {
          // Self-contained slot: local $defs + embedded closure.
          newObj.$ref = `#/$defs/${componentName}`;
          if (!addedComponents.has(componentName)) {
            addedComponents.add(componentName);
            if (result.$defs) {
              result.$defs[componentName] = processSchema(
                cloneJSON(components[componentName]) as VovkJSONSchemaBase
              ) as VovkJSONSchemaBase;
            }
          }
        }
        // emitDefs === false: keep `#/components/schemas/X`, no `$defs` (lives once in meta).
      } else {
        delete newObj.$ref; // $ref to a component not in components (e.g. Telegram API)
      }
    }

    // Process properties recursively
    for (const key in newObj) {
      if (Object.hasOwn(newObj, key)) {
        newObj[key as keyof VovkJSONSchemaBase] = processSchema(
          newObj[key as keyof VovkJSONSchemaBase]
        ) as VovkJSONSchemaBase;
      }
    }

    return newObj;
  }

  // Process the main schema
  return processSchema(result);
}

// re-attaches a response slot's `$defs` closure at render time (Rust needs self-contained schemas);
// pulls components from the segment's shared meta, no-op for non-mixin
export function reattachMixinDefs(
  slot: VovkJSONSchemaBase | undefined,
  segment: {
    segmentType?: string;
    segmentName: string;
    meta?: { openAPIObject?: { components?: ComponentsObject } };
  }
): VovkJSONSchemaBase | VovkJSONSchemaBase[] | undefined {
  if (!slot || segment?.segmentType !== 'mixin') return slot;
  const components = segment.meta?.openAPIObject?.components?.schemas;
  if (!components) return slot;
  return applyComponentsSchemas(slot, components, segment.segmentName, true);
}
