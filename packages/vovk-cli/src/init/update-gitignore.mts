import fs from 'node:fs/promises';
import path from 'node:path';
import { getRelativeSrcRoot } from '../get-project-info/get-config/get-relative-src-root.mjs';
import { toPosixPath } from '../utils/to-import-path.mjs';

// adds the default composed client folder and returns the entry, or null when .gitignore has it
export async function updateGitignore(root: string) {
  const srcRoot = await getRelativeSrcRoot({ cwd: root });
  // git reads "\" in .gitignore as an escape, so the entry keeps forward slashes on Windows
  const outDir = toPosixPath(path.join(srcRoot ?? '.', 'client'));
  const entry = `/${outDir}`;
  const gitignorePath = path.join(root, '.gitignore');
  const content = await fs.readFile(gitignorePath, 'utf-8').catch(() => '');

  const hasEntry = content.split('\n').some((line) => {
    const trimmed = line.trim().replace(/\/$/, '');
    return trimmed === entry || trimmed === outDir;
  });

  if (hasEntry) return null;

  const updated = `${content.length && !content.endsWith('\n') ? `${content}\n` : content}\n# vovk generated client\n${entry}\n`;
  await fs.writeFile(gitignorePath, updated, 'utf-8');

  return entry;
}
