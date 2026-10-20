import { IndentationText, Project, QuoteKind, SyntaxKind } from 'ts-morph';

export function addClassToSegmentCode(
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
    // the same output prettier gives, for projects without it
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      indentationText: IndentationText.TwoSpaces,
      useTrailingCommas: true,
    },
  });
  const sourceFile = project.createSourceFile('route.ts', segmentSourceCode, { overwrite: true });

  const importDeclaration = sourceFile.getImportDeclaration((imp) => {
    return imp.getModuleSpecifierValue() === importPath;
  });

  if (!importDeclaration) {
    sourceFile.addImportDeclaration({
      defaultImport: sourceName,
      moduleSpecifier: importPath,
    });
  }

  const variableDeclaration = sourceFile.getVariableDeclaration('controllers');
  if (variableDeclaration) {
    const initializer = variableDeclaration.getInitializer();

    if (initializer && initializer.getKind() === SyntaxKind.ObjectLiteralExpression) {
      const objectLiteral = initializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

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
