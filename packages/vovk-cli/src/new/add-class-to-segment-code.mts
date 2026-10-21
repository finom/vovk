import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { findControllersObject } from '../utils/get-segment-controllers.mjs';

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

  const controllers = findControllersObject(sourceFile);
  if (controllers && !controllers.getProperty(compiledName)) {
    controllers.addPropertyAssignment({
      name: compiledName,
      initializer: sourceName,
    });
  }

  return sourceFile.getFullText();
}
