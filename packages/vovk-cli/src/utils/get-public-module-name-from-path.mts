export function getPublicModuleNameFromPath(modulePath: string): {
  moduleName: string | null;
  restPath: string;
} {
  if (modulePath && !modulePath.startsWith('.') && !modulePath.startsWith('/')) {
    const pathParts = modulePath.split('/');
    const moduleName = pathParts[0].startsWith('@') ? `${pathParts[0]}/${pathParts[1]}` : pathParts[0];
    const restPath = pathParts.slice(pathParts[0].startsWith('@') ? 2 : 1).join('/');

    return { moduleName, restPath };
  }

  return { moduleName: null, restPath: modulePath };
}
