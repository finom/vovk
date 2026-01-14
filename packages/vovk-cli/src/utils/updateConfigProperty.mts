import { Project, QuoteKind, IndentationText, NewLineKind, SyntaxKind, CodeBlockWriter, Node } from 'ts-morph';

export function updateConfigProperty(sourceCode: string, pathToProperty: string[], newValue: unknown) {
  const project = createProject();
  const sourceFile = project.createSourceFile('config-temp.mts', sourceCode, { overwrite: true });
  return mutateConfig(sourceFile, pathToProperty, newValue);
}

export function updateConfigFileProperty(absolutePathToTheFile: string, pathToProperty: string[], newValue: unknown) {
  const project = createProject();
  const sourceFile = project.addSourceFileAtPath(absolutePathToTheFile);
  const updated = mutateConfig(sourceFile, pathToProperty, newValue);
  sourceFile.saveSync();
  return updated;
}

function createProject() {
  return new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      indentationText: IndentationText.TwoSpaces,
      newLineKind: NewLineKind.LineFeed,
    },
  });
}

function mutateConfig(sourceFile: import('ts-morph').SourceFile, pathToProperty: string[], newValue: unknown) {
  const variableDeclaration = sourceFile.getVariableDeclaration('config');
  if (!variableDeclaration) {
    throw new Error('config variable not found in the file.');
  }

  const initializer = variableDeclaration.getInitializer();
  if (!initializer || !Node.isObjectLiteralExpression(initializer)) {
    throw new Error('config is not initialized as an object literal.');
  }

  let currentNode = initializer;

  for (let i = 0; i < pathToProperty.length; i++) {
    const key = pathToProperty[i];
    const isLastKey = i === pathToProperty.length - 1;

    if (!Node.isObjectLiteralExpression(currentNode)) {
      throw new Error(`Property at path ${pathToProperty.slice(0, i).join('.')} is not an object.`);
    }

    const property = currentNode.getProperty(key);

    if (!property) {
      // Property does not exist
      if (newValue === undefined) {
        // Nothing to remove
        return sourceFile.getFullText();
      }

      if (isLastKey) {
        // Last key - add the final value
        currentNode.addPropertyAssignment({
          name: key,
          initializer: (writer) => writeInitializer(writer, newValue),
        });
      } else {
        // Need to create nested object
        const newObjectAssignment = currentNode.addPropertyAssignment({
          name: key,
          initializer: '{}',
        });
        currentNode = newObjectAssignment.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      }
    } else {
      // Property exists
      if (!Node.isPropertyAssignment(property)) {
        throw new Error(`Unsupported property kind at path ${pathToProperty.slice(0, i + 1).join('.')}.`);
      }

      const propInitializer = property.getInitializer();

      if (isLastKey) {
        // Last key - update or remove the value
        if (newValue === undefined) {
          property.remove();
        } else {
          property.setInitializer((writer) => writeInitializer(writer, newValue));
        }
      } else {
        // Need to go deeper into existing object
        if (propInitializer && Node.isObjectLiteralExpression(propInitializer)) {
          currentNode = propInitializer;
        } else {
          throw new Error(`Cannot traverse into non-object property at ${pathToProperty.slice(0, i + 1).join('.')}.`);
        }
      }
    }
  }

  return sourceFile.getFullText();
}

function writeInitializer(writer: CodeBlockWriter, value: unknown): void {
  if (typeof value === 'string') {
    writer.quote(value);
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    writer.write(value.toString());
  } else if (typeof value === 'function') {
    writer.write(value.toString());
  } else if (Array.isArray(value)) {
    writer.write('[');
    value.forEach((item, index) => {
      if (index > 0) writer.write(', ');
      writeInitializer(writer, item);
    });
    writer.write(']');
  } else if (typeof value === 'object' && value !== null) {
    writer.write('{');
    const entries = Object.entries(value);
    entries.forEach(([k, v], index) => {
      if (index > 0) writer.write(', ');
      writer.write(k);
      writer.write(': ');
      writeInitializer(writer, v);
    });
    writer.write('}');
  } else {
    writer.write('null');
  }
}
