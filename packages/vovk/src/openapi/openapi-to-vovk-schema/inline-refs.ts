import type { OpenAPIObject } from 'openapi3-ts/oas31';

// resolves $ref at the first level only (skips components/schemas refs), arrays checked per item
export function inlineRefs<T extends object>(obj: unknown, openAPIObject: OpenAPIObject): T | null {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (item && typeof item === 'object' && '$ref' in item && typeof item.$ref === 'string') {
        if (item.$ref.startsWith('#/components/schemas/')) {
          return item;
        }

        const resolved = resolveRef(item.$ref, openAPIObject);

        if (resolved !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $ref: _$ref, ...additionalProps } = item;
          if (Object.keys(additionalProps).length > 0) {
            return { ...resolved, ...additionalProps };
          }
          return resolved;
        }
      }
      return item;
    }) as T;
  }

  if (typeof obj !== 'object') {
    return obj as T;
  }

  if ('$ref' in obj && typeof obj.$ref === 'string') {
    if (obj.$ref.startsWith('#/components/schemas/')) {
      return obj as T;
    }

    const resolved = resolveRef(obj.$ref, openAPIObject);

    if (resolved !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { $ref: _$ref, ...additionalProps } = obj;
      if (Object.keys(additionalProps).length > 0) {
        return { ...resolved, ...additionalProps } as T;
      }
      return resolved as T;
    }
  }

  return obj as T;
}

// resolves a local $ref like "#/components/parameters/id", undefined if not found
function resolveRef(ref: string, openAPIObject: OpenAPIObject) {
  if (!ref.startsWith('#/')) {
    // eslint-disable-next-line no-console
    console.warn(`External references are not supported: ${ref}`);
    return undefined;
  }

  const path = ref
    .substring(1)
    .split('/')
    .filter((p) => p !== '');

  let current = openAPIObject;
  for (const segment of path) {
    // JSON Pointer escapes: ~1 is "/", ~0 is "~"
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
