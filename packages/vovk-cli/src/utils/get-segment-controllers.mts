import { type Node, type ObjectLiteralExpression, Project, type SourceFile, SyntaxKind } from 'ts-morph';

function unwrap(node: Node | undefined): Node | undefined {
  let current = node;
  while (
    current &&
    (current.isKind(SyntaxKind.AsExpression) ||
      current.isKind(SyntaxKind.SatisfiesExpression) ||
      current.isKind(SyntaxKind.ParenthesizedExpression) ||
      current.isKind(SyntaxKind.TypeAssertionExpression))
  ) {
    current = current.getExpression();
  }
  return current;
}

// the object a segment passes to initSegment as `controllers`, under any variable name; null when it isn't
// an object literal in the same file (imported, built in a loop and the like)
export function findControllersObject(sourceFile: SourceFile): ObjectLiteralExpression | null {
  const initSegmentNames = sourceFile
    .getImportDeclarations()
    .filter((declaration) => declaration.getModuleSpecifierValue() === 'vovk')
    .flatMap((declaration) => declaration.getNamedImports())
    .filter((namedImport) => namedImport.getName() === 'initSegment')
    .map((namedImport) => namedImport.getAliasNode()?.getText() ?? 'initSegment');

  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    if (!initSegmentNames.includes(call.getExpression().getText())) continue;
    const options = unwrap(call.getArguments()[0]);
    if (!options?.isKind(SyntaxKind.ObjectLiteralExpression)) continue;
    const property = options.getProperty('controllers');

    let value: Node | undefined;
    if (property?.isKind(SyntaxKind.PropertyAssignment)) value = unwrap(property.getInitializer());
    else if (property?.isKind(SyntaxKind.ShorthandPropertyAssignment)) value = property.getNameNode();

    if (value?.isKind(SyntaxKind.Identifier)) {
      value = unwrap(sourceFile.getVariableDeclaration(value.getText())?.getInitializer());
    }
    if (value?.isKind(SyntaxKind.ObjectLiteralExpression)) return value;
  }

  // a segment that gets initSegment some other way still has the variable vovk init and vovk new write
  const fallback = unwrap(sourceFile.getVariableDeclaration('controllers')?.getInitializer());
  return fallback?.isKind(SyntaxKind.ObjectLiteralExpression) ? fallback : null;
}

// the RPC module names of a segment, read from its route file without running it
export function getSegmentRpcModuleNames(routeSourceCode: string): string[] {
  const sourceFile = new Project({ useInMemoryFileSystem: true }).createSourceFile('route.ts', routeSourceCode);
  const controllers = findControllersObject(sourceFile);
  if (!controllers) return [];

  return controllers.getProperties().flatMap((property) => {
    if (property.isKind(SyntaxKind.ShorthandPropertyAssignment)) return [property.getName()];
    if (!property.isKind(SyntaxKind.PropertyAssignment)) return [];
    const nameNode = property.getNameNode();
    if (nameNode.isKind(SyntaxKind.Identifier)) return [nameNode.getText()];
    if (nameNode.isKind(SyntaxKind.StringLiteral)) return [nameNode.getLiteralText()];
    return [];
  });
}
