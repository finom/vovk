import { camelCase } from './camel-case.js';

const upperFirst = (word: string) => {
  const [first = '', ...rest] = word;
  return first.toUpperCase() + rest.join('');
};

// never empty: one that would start with a digit or a mark gets a leading underscore
export function toIdentifier(name: string, { pascalCase = false }: { pascalCase?: boolean } = {}): string {
  const words = camelCase(name);
  const identifier = (pascalCase ? upperFirst(words) : words).replace(/[^\p{ID_Continue}]/gu, '');
  return /^\p{ID_Start}/u.test(identifier) ? identifier : `_${identifier}`;
}

// the TypeScript type name of a name from an OpenAPI document, as in Mixins.<TypeName>.<TypeName>
export function toTypeName(name: string): string {
  return toIdentifier(name, { pascalCase: true });
}

// a name whose type name an earlier one took gets the first free numeric suffix
export function toTypeNames(names: Iterable<string>): Map<string, string> {
  const typeNames = new Map<string, string>();
  const taken = new Set<string>();
  const collided: [string, string][] = [];
  for (const name of names) {
    const typeName = toTypeName(name);
    if (taken.has(typeName)) {
      collided.push([name, typeName]);
    } else {
      taken.add(typeName);
      typeNames.set(name, typeName);
    }
  }
  // numbered after the rest, so a suffix never takes a name the document declares
  for (const [name, typeName] of collided) {
    let i = 2;
    while (taken.has(`${typeName}${i}`)) i++;
    taken.add(`${typeName}${i}`);
    typeNames.set(name, `${typeName}${i}`);
  }
  return typeNames;
}
