import fs from 'node:fs/promises';
import path from 'node:path';
import { getRelativeSrcRoot } from '../get-project-info/get-config/get-relative-src-root.mjs';
import { toPosixPath } from '../utils/to-import-path.mjs';

// the folders the py and rs templates write to by default
const LANG_OUT_DIRS: Record<string, string> = { py: 'dist_python', rs: 'dist_rust' };

// adds the default composed client folder, and the Python and Rust package folders for --lang, and returns the entries
// .gitignore didn't have
export async function updateGitignore(root: string, lang: string[] = []) {
  const srcRoot = await getRelativeSrcRoot({ cwd: root });
  // git reads "\" in .gitignore as an escape, so the entry keeps forward slashes on Windows
  const outDirs = [toPosixPath(path.join(srcRoot ?? '.', 'client')), ...lang.flatMap((l) => LANG_OUT_DIRS[l] ?? [])];
  const gitignorePath = path.join(root, '.gitignore');
  const content = await fs.readFile(gitignorePath, 'utf-8').catch(() => '');
  const lines = content.split('\n').map((line) => line.trim().replace(/\/$/, ''));

  const entries = outDirs
    .filter((outDir) => !lines.includes(`/${outDir}`) && !lines.includes(outDir))
    .map((outDir) => `/${outDir}`);

  if (!entries.length) return entries;

  const updated = `${content.length && !content.endsWith('\n') ? `${content}\n` : content}\n# vovk generated client\n${entries.join('\n')}\n`;
  await fs.writeFile(gitignorePath, updated, 'utf-8');

  return entries;
}
