import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// A fence with `filename` and `source` mirrors a file of the vovk repository:
// ```ts filename="src/modules/user/user-controller.ts" source="examples/hello-world"
// The file is copied into the fence, and the next line links to it on GitHub.
const GITHUB_BLOB = 'https://github.com/finom/vovk/blob/main';

function findRepoRoot(from: string) {
  for (let dir = path.resolve(from); ; dir = path.dirname(dir)) {
    if (existsSync(path.join(dir, 'packages/vovk/package.json')) && existsSync(path.join(dir, 'examples'))) return dir;
    if (path.dirname(dir) === dir) return null;
  }
}

function parseAttrs(fenceLine: string) {
  const attrs: Record<string, string> = {};
  for (const m of fenceLine.matchAll(/([a-zA-Z0-9_-]+)=(?:"([^"]+)"|'([^']+)'|([^\s"']+))/g)) {
    attrs[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

async function updateCodeBlocks(mdx: string, repoRoot: string) {
  const blockRe = /```(?<fenceLine>[^\n]*)\n(?<code>[\s\S]*?)\n```(?<linkLine>\n\*\[[^\n]*\]\([^)]+\)\*?)?/g;
  let out = '';
  let lastIndex = 0;
  for (const match of mdx.matchAll(blockRe)) {
    out += mdx.slice(lastIndex, match.index);
    lastIndex = match.index + match[0].length;
    const { fenceLine = '', code = '', linkLine = '' } = match.groups ?? {};
    const { filename, source } = parseAttrs(fenceLine);
    const file = filename && source ? path.join(repoRoot, source, filename) : null;
    if (!file || !existsSync(file)) {
      if (file) console.warn(`Missing ${path.relative(repoRoot, file)}, the fence stays as it is`);
      out += match[0];
      continue;
    }
    const content = (await readFile(file, 'utf8')).trim();
    const link = `*[The code above is fetched from GitHub repository.](${GITHUB_BLOB}/${path.posix.join(source, filename)})*`;
    out += content === code && linkLine ? match[0] : `\`\`\`${fenceLine}\n${content}\n\`\`\`\n${link}`;
  }
  return out + mdx.slice(lastIndex);
}

async function getMdxFiles(dir: string, acc: string[] = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await getMdxFiles(full, acc);
    else if (entry.name.endsWith('.mdx')) acc.push(full);
  }
  return acc;
}

const repoRoot = findRepoRoot(process.cwd());
if (!repoRoot) {
  console.info('Not inside the vovk repository, code blocks are left as they are');
} else {
  let updated = 0;
  const files = await getMdxFiles(path.join(process.cwd(), 'src/app'));
  for (const file of files) {
    const original = await readFile(file, 'utf8');
    const result = await updateCodeBlocks(original, repoRoot);
    if (result !== original) {
      await writeFile(file, result);
      updated++;
    }
  }
  console.info(`Code blocks synced: ${updated} of ${files.length} MDX files changed`);
}
