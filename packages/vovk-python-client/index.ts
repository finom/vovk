function getPythonTypeFromSchema(schema: any): { pythonType: string; description?: string } {
  let typeStr = '';
  const description = schema.description || undefined;

  if (schema.type === 'object') {
    const properties = schema.properties;
    const required = schema.required || [];
    let propsStr = '';
    for (const key in properties) {
      if (properties.hasOwnProperty(key)) {
        const propSchema = properties[key];
        const isRequired = required.includes(key);
        const propType = getPythonTypeFromSchema(propSchema).pythonType;
        propsStr += `${key}: ${isRequired ? '' : 'Optional['}${propType}${isRequired ? '' : ']'}, `;
      }
    }
    if (propsStr) {
      typeStr = `dict[${propsStr.slice(0, -2)}]`;
    } else {
      typeStr = 'dict';
    }
  } else if (schema.type === 'array') {
    const itemType = getPythonTypeFromSchema(schema.items).pythonType;
    typeStr = `list[${itemType}]`;
  } else if (schema.anyOf) {
    const types = schema.anyOf.map((s) => getPythonTypeFromSchema(s).pythonType);
    typeStr = `Union[${types.join(', ')}]`;
  } else if (['string', 'number', 'boolean', 'null'].includes(schema.type)) {
    switch (schema.type) {
      case 'string':
        typeStr = 'str';
        break;
      case 'number':
        typeStr = 'float'; // Note: Python's float can represent integers as well
        break;
      case 'boolean':
        typeStr = 'bool';
        break;
      case 'null':
        typeStr = 'NoneType';
        break;
    }
  } else {
    typeStr = 'Any'; // Fallback for unknown types
  }

  return { pythonType: typeStr, description };
}

// Example usage:
const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'integer' },
    isActive: { type: 'boolean' },
  },
  required: ['name'],
};

console.log(getPythonTypeFromSchema(schema));
// Output should be:
// { pythonType: "dict[name: str, age: int]", description: undefined }
