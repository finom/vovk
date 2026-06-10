import type { ComponentsObject } from 'openapi3-ts/oas31';

// Collect the trailing name of every `$ref` in the tree. Covers both pointer styles
// the transform emits: `#/components/schemas/X` (response slots, raw operation objects)
// and `#/$defs/X` (request slots embed components under their original names).
function collectRefNames(node: unknown, into: Set<string>): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) {
      collectRefNames(item, into);
    }
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === '$ref' && typeof value === 'string') {
      const name = value.split('/').pop();
      if (name) into.add(name);
    } else {
      collectRefNames(value, into);
    }
  }
}

/**
 * Shrinks a `components.schemas` dict to the transitive `$ref` closure of `roots`
 * (BFS with a visited set — component graphs of large specs like Stripe are cyclic).
 * Preserves the original key order for deterministic output.
 */
export function pruneComponentsSchemas(
  roots: unknown,
  componentsSchemas: NonNullable<ComponentsObject['schemas']>
): NonNullable<ComponentsObject['schemas']> {
  const required = new Set<string>();
  collectRefNames(roots, required);
  const queue = [...required];
  const visited = new Set<string>();

  while (queue.length) {
    const name = queue.pop();
    if (!name || visited.has(name)) continue;
    visited.add(name);
    const component = componentsSchemas[name];
    if (!component) continue;
    const refs = new Set<string>();
    collectRefNames(component, refs);
    for (const ref of refs) {
      required.add(ref);
      if (!visited.has(ref)) queue.push(ref);
    }
  }

  return Object.fromEntries(Object.entries(componentsSchemas).filter(([name]) => required.has(name)));
}
