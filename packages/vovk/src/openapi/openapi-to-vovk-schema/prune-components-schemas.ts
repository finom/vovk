import type { ComponentsObject } from 'openapi3-ts/oas31';
import { decodeJSONPointerToken } from '../../utils/map-json-schema-refs.js';

function forEachRef(node: unknown, fn: (ref: string) => void): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) {
      forEachRef(item, fn);
    }
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string') fn(value);
    else forEachRef(value, fn);
  }
}

// the component a $ref points to or into: `#/components/responses/NotFound` is the response NotFound
function componentOfRef(ref: string): { section: string; name: string } | null {
  const [hash, components, section, token] = ref.split('/');
  const name = token === undefined ? null : decodeJSONPointerToken(token);
  if (hash !== '#' || components !== 'components' || !section || name === null) return null;
  return { section, name };
}

// the schemas the roots reach through $refs, also through other components such as a response; the reached set
// stops a cycle, which big specs such as Stripe's have, and the result keeps the key order
export function pruneComponentsSchemas(
  roots: unknown,
  components: ComponentsObject
): NonNullable<ComponentsObject['schemas']> {
  const reached = new Set<string>();
  const queue: unknown[] = [roots];

  while (queue.length) {
    forEachRef(queue.pop(), (ref) => {
      const component = componentOfRef(ref);
      if (!component) return;
      const key = `${component.section}/${component.name}`;
      if (reached.has(key)) return;
      reached.add(key);
      const section: unknown = components[component.section as keyof ComponentsObject];
      if (section && typeof section === 'object' && Object.hasOwn(section, component.name)) {
        queue.push((section as Record<string, unknown>)[component.name]);
      }
    });
  }

  return Object.fromEntries(
    Object.entries(components.schemas ?? {}).filter(([name]) => reached.has(`schemas/${name}`))
  );
}
