import { Project, QuoteKind, IndentationText, NewLineKind, SyntaxKind, CodeBlockWriter, Node } from 'ts-morph';
import { KnownAny } from '../../src/types.mjs';

export default function updateConfigProperty(
  absolutePathToTheFile: string,
  pathToProperty: string[],
  newValue: KnownAny
): void {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      indentationText: IndentationText.TwoSpaces,
      newLineKind: NewLineKind.LineFeed,
    },
  });

  const sourceFile = project.addSourceFileAtPath(absolutePathToTheFile);

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

    if (!Node.isObjectLiteralExpression(currentNode)) {
      throw new Error(`Property at path ${pathToProperty.slice(0, i).join('.')} is not an object.`);
    }

    const property = currentNode.getProperty(key);

    if (!property) {
      // Property does not exist
      if (newValue === undefined) {
        // Nothing to remove
        return;
      } else {
        // Create property
        if (i === pathToProperty.length - 1) {
          // Last key
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
          const init = newObjectAssignment.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
          currentNode = init;
        }
      }
    } else {
      // Property exists
      if (Node.isPropertyAssignment(property)) {
        const propInitializer = property.getInitializer();
        if (i === pathToProperty.length - 1) {
          // Last key
          if (newValue === undefined) {
            // Remove the property
            property.remove();
          } else {
            // Update the value
            property.setInitializer((writer) => writeInitializer(writer, newValue));
          }
        } else {
          // Need to go deeper
          if (propInitializer && Node.isObjectLiteralExpression(propInitializer)) {
            currentNode = propInitializer;
          } else {
            throw new Error(`Cannot traverse into non-object property at ${pathToProperty.slice(0, i + 1).join('.')}.`);
          }
        }
      } else {
        throw new Error(`Unsupported property kind at path ${pathToProperty.slice(0, i + 1).join('.')}.`);
      }
    }
  }

  sourceFile.saveSync();
}

function writeInitializer(writer: CodeBlockWriter, value: KnownAny): void {
  if (typeof value === 'string') {
    writer.quote(value);
  } else if (typeof value === 'number' || typeof value === 'boolean') {
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
