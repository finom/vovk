import type { ComponentsObject } from 'openapi3-ts/oas31';
import { camelCase } from '../../utils/camelCase.js';
import { upperFirst } from '../../utils/upperFirst.js';
import type { VovkJSONSchemaBase } from '../../types/json-schema.js';

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
  mixinName: string
): VovkJSONSchemaBase | VovkJSONSchemaBase[] {
  const key = 'components/schemas';
  if (!components || !Object.keys(components).length) return schema;

  // Create a deep copy of the schema
  const result = cloneJSON(schema) as VovkJSONSchemaBase;

  // Initialize $defs if it doesn't exist
  result.$defs = result.$defs || {};

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
      if (components![componentName]) {
        newObj.$ref = `#/$defs/${componentName}`;
        newObj['x-tsType'] ??= `Mixins.${upperFirst(camelCase(mixinName))}.${upperFirst(camelCase(componentName))}`;
      } else {
        delete newObj.$ref; // Remove $ref if component not found (Telegram API has Type $refs that is not defined in components)
      }

      // Add the component to $defs if not already added
      if (!addedComponents.has(componentName) && components![componentName]) {
        addedComponents.add(componentName);
        if (result.$defs) {
          result.$defs[componentName] = processSchema(
            cloneJSON(components![componentName]) as VovkJSONSchemaBase
          ) as VovkJSONSchemaBase;
        }
      }
    }

    // Process properties recursively
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
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
