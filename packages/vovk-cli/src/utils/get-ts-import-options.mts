import fs from 'node:fs/promises';
import path from 'node:path';
import { getTsconfig } from 'get-tsconfig';

// how the project's tsconfig.json wants relative imports written; no tsconfig.json at all is a Next.js default
export function getTsImportOptions(cwd: string) {
  const { module, moduleResolution, allowImportingTsExtensions, rewriteRelativeImportExtensions } =
    getTsconfig(cwd)?.config?.compilerOptions ?? {};

  return {
    module: module?.toLowerCase(),
    // without moduleResolution TypeScript resolves like Node.js only for a node16+ module
    isNodeNextResolution: /^node(16|18|20|next)$/i.test(moduleResolution ?? module ?? ''),
    // such an import names its file, a .ts file goes by its .js name unless TypeScript may import .ts
    tsExtension: allowImportingTsExtensions || rewriteRelativeImportExtensions ? '.ts' : '.js',
  };
}

async function isESModule(filePath: string): Promise<boolean> {
  if (/\.m[jt]s$/.test(filePath)) return true;
  if (/\.c[jt]s$/.test(filePath)) return false;
  for (let dir = path.dirname(filePath); ; dir = path.dirname(dir)) {
    const packageJson = await fs.readFile(path.join(dir, 'package.json'), 'utf-8').catch(() => null);
    if (packageJson !== null) {
      try {
        return JSON.parse(packageJson).type === 'module';
      } catch {
        return false;
      }
    }
    if (path.dirname(dir) === dir) return false;
  }
}

// under node18, node20 and nodenext a JSON import in an ES module needs the attribute and one in a CommonJS file refuses it;
// node16 refuses it everywhere
export async function getJSONImportAttributes(module: string | undefined, filePath: string): Promise<string> {
  const attributes = ' with { type: "json" }';
  if (module === 'node16') return '';
  if (!/^node(18|20|next)$/.test(module ?? '')) return attributes;
  return (await isESModule(filePath)) ? attributes : '';
}
