import { OpenAPIObject } from 'openapi3-ts/oas31';
import { KnownAny } from '../../types.js';

/**
 * Resolves $ref references at the first level only (except for components/schemas references)
 * For arrays, checks each item at the first level
 * @param obj - The object to process (may contain $ref properties)
 * @param openAPIObject - The complete OpenAPI document containing definitions
 * @returns The object with resolved references (except components/schemas)
 */
export function inlineRefs<T extends object>(obj: KnownAny, openAPIObject: OpenAPIObject): T {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  // Handle arrays - check each item for $ref at first level only
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      // Only resolve if item is an object with $ref
      if (item && typeof item === 'object' && '$ref' in item && typeof item.$ref === 'string') {
        // Skip components/schemas references
        if (item.$ref.startsWith('#/components/schemas/')) {
          return item;
        }

        // Resolve the reference
        const resolved = resolveRef(item.$ref, openAPIObject);

        // If resolution successful, return resolved value (with any additional properties merged)
        if (resolved !== undefined) {
          // If there are additional properties besides $ref, merge them
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $ref: _$ref, ...additionalProps } = item;
          if (Object.keys(additionalProps).length > 0) {
            return { ...resolved, ...additionalProps };
          }
          return resolved;
        }
      }
      // Return item as-is if not a resolvable $ref
      return item;
    }) as T;
  }

  // Handle non-objects (primitives)
  if (typeof obj !== 'object') {
    return obj as T;
  }

  // Check if object has a $ref property at the first level
  if ('$ref' in obj && typeof obj.$ref === 'string') {
    // Check if the reference points to components/schemas
    if (obj.$ref.startsWith('#/components/schemas/')) {
      // Return as-is for schema references
      return obj as T;
    }

    // Resolve the reference
    const resolved = resolveRef(obj.$ref, openAPIObject);

    // If resolution successful, return resolved value (with any additional properties merged)
    if (resolved !== undefined) {
      // If there are additional properties besides $ref, merge them
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $ref: _$ref, ...additionalProps } = obj;
      if (Object.keys(additionalProps).length > 0) {
        return { ...resolved, ...additionalProps } as T;
      }
      return resolved as T;
    }
  }

  // For regular objects without $ref, return as-is (no recursion)
  return obj as T;
}

/**
 * Resolves a JSON Reference ($ref) to its target value
 * @param ref - The reference string (e.g., "#/components/parameters/id")
 * @param openAPIObject - The complete OpenAPI document
 * @returns The resolved value or undefined if not found
 */
function resolveRef(ref: string, openAPIObject: OpenAPIObject) {
  // Handle only local references (starting with #)
  if (!ref.startsWith('#/')) {
    // eslint-disable-next-line no-console
    console.warn(`External references are not supported: ${ref}`);
    return undefined;
  }

  // Remove the leading # and split the path
  const path = ref
    .substring(1)
    .split('/')
    .filter((p) => p !== '');

  // Navigate through the object following the path
  let current = openAPIObject;
  for (const segment of path) {
    // Decode the segment (handles encoded characters like ~0 for ~ and ~1 for /)
    const decodedSegment = segment.replace(/~1/g, '/').replace(/~0/g, '~');

    if (current && typeof current === 'object' && decodedSegment in current) {
      current = current[decodedSegment as keyof typeof current];
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Could not resolve reference: ${ref}`);
      return undefined;
    }
  }

  return current;
}
