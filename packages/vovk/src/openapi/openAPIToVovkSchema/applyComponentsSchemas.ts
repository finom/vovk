import { ComponentsObject } from 'openapi3-ts/oas31';
import { camelCase } from '../../utils/camelCase';
import { upperFirst } from '../../utils/upperFirst';
import { KnownAny, SimpleJSONSchema } from '../../types';

// fast clone JSON object while ignoring Date, RegExp, and Function types
function cloneJSON(obj: KnownAny): KnownAny {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(cloneJSON);
  const result: Record<string, KnownAny> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date || value instanceof RegExp || typeof value === 'function') continue;
    result[key] = cloneJSON(value);
  }
  return result;
}

export function applyComponentsSchemas(
  schema: SimpleJSONSchema,
  components: ComponentsObject['schemas'],
  mixinName: string
): SimpleJSONSchema | SimpleJSONSchema[] {
  const key = 'components/schemas';
  if (!components || !Object.keys(components).length) return schema;

  // Create a deep copy of the schema
  const result = cloneJSON(schema);

  // Initialize $defs if it doesn't exist
  result.$defs = result.$defs || {};

  // Set to track components we've added to $defs
  const addedComponents = new Set<string>();

  // Process a schema object and replace $refs
  function processSchema(obj: SimpleJSONSchema): SimpleJSONSchema | SimpleJSONSchema[] {
    if (!obj || typeof obj !== 'object') return obj;

    // Handle arrays first - they don't have $ref
    if (Array.isArray(obj)) {
      return obj.map((item) => processSchema(item)) as SimpleJSONSchema[];
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
        // TODO: Optimize
        result.$defs[componentName] = processSchema(cloneJSON(components![componentName]));
      }
    }

    // Process properties recursively
    for (const key in newObj) {
      if (Object.prototype.hasOwnProperty.call(newObj, key)) {
        newObj[key as keyof SimpleJSONSchema] = processSchema(
          newObj[key as keyof SimpleJSONSchema]
        ) as SimpleJSONSchema;
      }
    }

    return newObj;
  }

  // Process the main schema
  return processSchema(result);
}
