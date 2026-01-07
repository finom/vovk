import type { VovkConfig } from 'vovk';
import { prettify } from '../../src/utils/prettify.mts';
import fs from 'node:fs/promises';
import { Project, SyntaxKind, ObjectLiteralExpression, Node } from 'ts-morph';

/**
 * Converts a JS value to a ts-morph compatible source string
 */
function valueToSource(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return `[${value.map(valueToSource).join(', ')}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: ${valueToSource(v)}`)
      .join(', ');
    return `{ ${entries} }`;
  }
  return String(value);
}

/**
 * Recursively merges updates into an ObjectLiteralExpression
 */
function mergeIntoObjectLiteral(objLiteral: ObjectLiteralExpression, updates: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(updates)) {
    const existingProp = objLiteral.getProperty(key);

    if (existingProp && Node.isPropertyAssignment(existingProp)) {
      const initializer = existingProp.getInitializer();

      // If both existing and new values are objects, merge recursively
      if (
        initializer &&
        Node.isObjectLiteralExpression(initializer) &&
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        mergeIntoObjectLiteral(initializer, value as Record<string, unknown>);
      } else {
        // Replace the value
        existingProp.setInitializer(valueToSource(value));
      }
    } else if (existingProp && Node.isShorthandPropertyAssignment(existingProp)) {
      // Convert shorthand to full property assignment with new value
      const index = objLiteral.getProperties().indexOf(existingProp);
      existingProp.remove();
      objLiteral.insertPropertyAssignment(index, {
        name: key,
        initializer: valueToSource(value),
      });
    } else {
      // Property doesn't exist, add it
      objLiteral.addPropertyAssignment({
        name: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key),
        initializer: valueToSource(value),
      });
    }
  }
}

/**
 * Finds the config object literal in the source file
 */
function findConfigObjectLiteral(
  sourceFile: ReturnType<Project['createSourceFile']>
): ObjectLiteralExpression | undefined {
  // Try to find `const config = { ... }`
  const configVar = sourceFile.getVariableDeclaration('config');
  if (configVar) {
    const initializer = configVar.getInitializer();
    if (initializer && Node.isObjectLiteralExpression(initializer)) {
      return initializer;
    }
  }

  // Try to find default export: `export default { ... }`
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    const decls = defaultExport.getDeclarations();
    for (const decl of decls) {
      if (Node.isExportAssignment(decl)) {
        const expr = decl.getExpression();
        if (Node.isObjectLiteralExpression(expr)) {
          return expr;
        }
      }
    }
  }

  // Try to find `module.exports = { ... }`
  const moduleExports = sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).find((bin) => {
    const left = bin.getLeft();
    return left.getText() === 'module.exports';
  });
  if (moduleExports) {
    const right = moduleExports.getRight();
    if (Node.isObjectLiteralExpression(right)) {
      return right;
    }
    if (Node.isIdentifier(right) && right.getText() === 'config') {
      // module.exports = config; - find the config variable
      return findConfigObjectLiteral(sourceFile);
    }
  }

  return undefined;
}

export default async function updateConfig(
  configAbsolutePath: string,
  update: (config: VovkConfig) => Omit<VovkConfig, 'bundle'> & {
    bundle?: Partial<VovkConfig['bundle']>;
  }
): Promise<void> {
  const originalContent = await fs.readFile(configAbsolutePath, 'utf-8');

  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('config.ts', originalContent);

  const configObjectLiteral = findConfigObjectLiteral(sourceFile);

  if (!configObjectLiteral) {
    throw new Error(`Could not find config object in ${configAbsolutePath}`);
  }

  // Import the original config to get the update diff
  const configImport = await import(configAbsolutePath);
  const originalConfig = (configImport.default ?? configImport) as VovkConfig;
  const updatedConfig = update(originalConfig);

  // Calculate what properties need to be added/updated
  // We merge the entire updatedConfig - the merge function handles existing props
  mergeIntoObjectLiteral(configObjectLiteral, updatedConfig as unknown as Record<string, unknown>);

  const updatedContent = sourceFile.getFullText();
  const prettified = await prettify(updatedContent, configAbsolutePath);

  await fs.writeFile(configAbsolutePath, prettified, 'utf-8');
}
