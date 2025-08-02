import { Project, QuoteKind, SyntaxKind } from 'ts-morph';

export default function addClassToSegmentCode(
  segmentSourceCode: string,
  {
    sourceName,
    compiledName,
    importPath,
  }: {
    sourceName: string;
    compiledName: string;
    importPath: string;
  }
): string {
  const project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
    },
  });
  const sourceFile = project.createSourceFile('route.ts', segmentSourceCode, { overwrite: true });

  // Add the import if it doesn't exist
  let importDeclaration = sourceFile.getImportDeclaration((imp) => {
    return imp.getModuleSpecifierValue() === importPath;
  });

  if (!importDeclaration) {
    importDeclaration = sourceFile.addImportDeclaration({
      defaultImport: sourceName,
      moduleSpecifier: importPath,
    });
  }

  // Get the variable declaration for controllers
  const variableDeclaration = sourceFile.getVariableDeclaration('controllers');
  if (variableDeclaration) {
    const initializer = variableDeclaration.getInitializer();

    if (initializer && initializer.getKind() === SyntaxKind.ObjectLiteralExpression) {
      const objectLiteral = initializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

      // Check if the property already exists
      const existingProperty = objectLiteral.getProperty(compiledName);
      if (!existingProperty) {
        objectLiteral.addPropertyAssignment({
          name: compiledName,
          initializer: sourceName,
        });
      }
    }
  }

  return sourceFile.getFullText();
}
