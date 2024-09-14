import { Project, SyntaxKind } from 'ts-morph';

export default function addClassToSegmentCode(
  segmentSourceCode: string,
  {
    className,
    rpcName,
    type,
    importPath,
  }: {
    className: string;
    rpcName: string;
    type: 'worker' | 'controller';
    importPath: string;
  }
): string {
  const project = new Project();
  const sourceFile = project.createSourceFile('route.ts', segmentSourceCode, { overwrite: true });

  // Add the import if it doesn't exist
  let importDeclaration = sourceFile.getImportDeclaration((imp) => {
    return imp.getModuleSpecifierValue() === importPath;
  });

  if (!importDeclaration) {
    importDeclaration = sourceFile.addImportDeclaration({
      defaultImport: className,
      moduleSpecifier: importPath,
    });
  }

  // Get the variable declaration for controllers or workers
  const variableDeclaration = sourceFile.getVariableDeclaration(`${type}s`);
  if (variableDeclaration) {
    const initializer = variableDeclaration.getInitializer();

    if (initializer && initializer.getKind() === SyntaxKind.ObjectLiteralExpression) {
      const objectLiteral = initializer.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

      // Check if the property already exists
      const existingProperty = objectLiteral.getProperty(rpcName);
      if (!existingProperty) {
        objectLiteral.addPropertyAssignment({
          name: rpcName,
          initializer: className,
        });
      }
    }
  }

  return sourceFile.getFullText();
}
