import { getTsconfig } from 'get-tsconfig';

// how the project's tsconfig.json wants relative imports written; no tsconfig.json at all is a Next.js default
export function getTsImportOptions(cwd: string) {
  const { module, moduleResolution, allowImportingTsExtensions, rewriteRelativeImportExtensions } =
    getTsconfig(cwd)?.config?.compilerOptions ?? {};

  return {
    // without moduleResolution TypeScript resolves like Node.js only for a node16+ module
    isNodeNextResolution: /^node(16|18|20|next)$/i.test(moduleResolution ?? module ?? ''),
    // such an import names its file, a .ts file goes by its .js name unless TypeScript may import .ts
    tsExtension: allowImportingTsExtensions || rewriteRelativeImportExtensions ? '.ts' : '.js',
  };
}
