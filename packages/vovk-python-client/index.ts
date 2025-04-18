import type { KnownAny } from 'vovk';

interface JSONSchema {
  type?: string | string[];
  enum?: KnownAny[];
  items?: JSONSchema | JSONSchema[];
  properties?: { [key: string]: JSONSchema };
  required?: string[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  format?: string;
}

interface ConvertOptions {
  schema: JSONSchema;
  namespace: string;
  className: string;
  pad: number;
}

/**
 * Convert a JSON schema to Python type definitions (TypedDict and others).
 * Returns a string containing Python code with all needed classes and the top-level type.
 */
export function convertJSONSchemaToPythonType(options: ConvertOptions): string {
  const { schema, namespace, className } = options;

  if (!schema) return '';

  // A buffer to collect the generated class definitions, in order of creation.
  // We'll add definitions for nested objects (TypedDicts) before we define the top-level class.
  const classDefinitions: string[] = [];

  // To avoid re-generating the same schema multiple times, keep track of
  // name -> fully qualified type, or schema object -> type mapping, etc.
  // For simplicity, we do a naive approach. In a bigger system, you might want a
  // more robust hashing of schemas or $ref resolution.
  const seenObjects = new Map<JSONSchema, string>();

  /**
   * Turn a schema into a Python type expression (e.g., "str", "int", "MyNamespace.MyClass", "List[str]", etc.)
   *
   * If the schema is for an object, it will generate a new TypedDict class
   * definition (unless one already exists for that schema) and return its name.
   *
   * `propNameForParent` is used to help generate child class names (e.g., "Body_x_y").
   */
  function buildType(s: JSONSchema, propNameForParent: string): string {
    // For convenience, handle arrays of type or single type
    // (e.g. type: ['string', 'null']) => Union[str, None]
    const allTypes = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];

    // 1. Enums
    if (s.enum && s.enum.length > 0) {
      // If there's an enum, we generate a `Literal[...]` of those values.
      // Example: enum: ["A", "B"] => Literal["A", "B"]
      // For numeric enums: enum: [1, 2] => Literal[1, 2]
      const literalValues = s.enum.map((val) => (typeof val === 'string' ? `"${val}"` : val));
      return `Literal[${literalValues.join(', ')}]`;
    }

    // 2. allOf
    //    Merge sub-schemas into a single "object" type. A naive approach is:
    //    - gather all properties from sub-schemas
    //    - combine required arrays
    //    - produce a new object schema
    // In more advanced usage, allOf could be something else (like a union), but typically it's merging.
    if (s.allOf && s.allOf.length > 0) {
      const merged: JSONSchema = {
        type: 'object',
        properties: {},
        required: [],
      };
      for (const sub of s.allOf) {
        const subType = sub.type;
        // if sub-type is "object", merge the properties
        if (!subType || subType === 'object') {
          merged.properties = {
            ...merged.properties,
            ...sub.properties,
          };
          // merge required
          if (sub.required) {
            merged.required = Array.from(new Set([...merged.required!, ...sub.required]));
          }
        } else {
          // If we see a primitive in allOf, that's trickier.
          // For simplicity, treat it as we would an 'object' with no properties.
        }
      }
      return buildType(merged, propNameForParent);
    }

    // 3. anyOf / oneOf => Union
    //    We'll produce a Union of all possible sub-schemas.
    if (s.anyOf && s.anyOf.length > 0) {
      const subTypes = s.anyOf.map((sub, i) => buildType(sub, propNameForParent + `_anyOf_${i}`));
      return `Union[${subTypes.join(', ')}]`;
    }
    if (s.oneOf && s.oneOf.length > 0) {
      const subTypes = s.oneOf.map((sub, i) => buildType(sub, propNameForParent + `_oneOf_${i}`));
      return `Union[${subTypes.join(', ')}]`;
    }

    // 4. If we can detect multiple types, produce a Union
    //    E.g. type: ["string", "null"] => Union[str, None]
    if (allTypes.length > 1) {
      const subTypes = allTypes.map((t) => buildType({ ...s, type: t }, propNameForParent));
      return `Union[${subTypes.join(', ')}]`;
    }

    // 5. If there's exactly one type
    if (allTypes.length === 1) {
      switch (allTypes[0]) {
        case 'string':
          // If format is "date-time", "date", etc., we might want a special python type.
          // For simplicity, treat them all as "str".
          return 'str';
        case 'boolean':
          return 'bool';
        case 'integer':
          return 'int';
        case 'number':
          return 'float';
        case 'null':
          // Just "None" in Python. If you want it optional, might do Optional[<something>].
          return 'None';
        case 'array':
          // `items` can be a single schema or an array of schemas (tuple form).
          // If it's an array of schemas, we'd produce a tuple. For simplicity, do Union or just a single type.
          if (Array.isArray(s.items)) {
            // naive approach: treat as a tuple of the listed item types
            const tupleTypes = s.items.map((sub, i) => buildType(sub, propNameForParent + `_items_${i}`));
            return `Tuple[${tupleTypes.join(', ')}]`;
          } else if (s.items) {
            const itemType = buildType(s.items, propNameForParent + `_items`);
            return `List[${itemType}]`;
          } else {
            // array of anything
            return `List[Any]`;
          }

        case 'object': {
          // We create a TypedDict. Possibly we have 'properties' to evaluate.
          // If we've seen this exact schema object, return the previously created name.
          if (seenObjects.has(s)) {
            return seenObjects.get(s)!;
          }

          // Generate a new class name. For the top-level class, use className as-is.
          // For nested classes, prefix with double underscore to indicate private classes.
          const isTopLevel = propNameForParent === className;
          const newClassName = isTopLevel ? className : `__${propNameForParent}`;
          const fullyQualifiedName = `${namespace}.${newClassName}`;

          // Mark this schema as seen
          seenObjects.set(s, fullyQualifiedName);

          // Start building the class definition lines
          const lines: string[] = [];
          lines.push(`class ${newClassName}(TypedDict):`);

          const props = s.properties || {};
          const required = new Set(s.required || []);

          if (Object.keys(props).length === 0) {
            // No properties => use 'pass' to make a valid class in Python
            lines.push(`    pass`);
          } else {
            for (const [propName, propSchema] of Object.entries(props)) {
              const isRequired = required.has(propName);
              // Build the child type, using the parent name without prefix for path construction
              const childPropPath = `${propNameForParent}_${propName}`;
              const childPropType = buildType(propSchema, childPropPath);
              // If it's not required, we do "Optional[<type>]"
              const finalType = isRequired ? childPropType : `Optional[${childPropType}]`;
              lines.push(`    ${propName}: ${finalType}`);
            }
          }

          // Add the class definition to our definitions array
          classDefinitions.push(lines.join('\n'));

          // Return the fully qualified name so parents can reference it
          return fullyQualifiedName;
        }
        default:
          // Fallback: if there's a type we haven't handled, just say `Any`
          return 'Any';
      }
    }

    // 6. If no type is declared, treat it as "Any"
    return 'Any';
  }

  // 1. Build the type for the top-level schema
  //    The top-level might produce either "str", "int", or a typed-dict class, etc.
  const topLevelTypeName = buildType(schema, className);

  // 2. If the top-level is itself a class (TypedDict), we've already generated it.
  //    But if it's a primitive, union, etc., we might want to create a top-level alias or class.
  //    In the example, the user wants a top-level "class Body(TypedDict): ...", so if the schema
  //    is an object, we do indeed have a class named "Body(...)" in the definitions array.
  //    If not an object, let's create a type alias or a dummy class for the top-level anyway.
  const isTypedDictTop =
    topLevelTypeName === `${namespace}.${className}` &&
    classDefinitions.some((def) => def.startsWith(`class ${className}(`));

  if (!isTypedDictTop) {
    // The top-level was not an object or wasn't automatically named `className`.
    // Let's define a top-level alias for consistency. e.g.:
    //
    // Body = Union[str, None]
    //
    // Or if it is an object but has a different auto-generated name, we alias it.
    classDefinitions.push(`${className} = ${topLevelTypeName}`);
  }

  return classDefinitions
    .join('\n')
    .split('\n')
    .map((line) => `${' '.repeat(options.pad)}${line}`)
    .join('\n');
}
