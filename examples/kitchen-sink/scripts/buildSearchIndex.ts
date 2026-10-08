import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import * as pagefind from 'pagefind';

// Indexes the prerendered pages for the Nextra search.
// next build writes them to .next/server/app, or, under a deployment adapter such as Vercel's,
// to .next/server/route-cache/APP_PAGE/<route hash>/$/<page>.html
const SERVER_DIR = '.next/server';
const PAGE_PATH = /^(?:app|route-cache\/APP_PAGE\/[^/]+\/\$)\/(.+\.html)$/;

const { index } = await pagefind.createIndex();
if (!index) throw new Error('Pagefind could not create an index');

const pages = (await readdir(SERVER_DIR, { recursive: true }))
  .map((file) => ({ file, sourcePath: PAGE_PATH.exec(file.split(path.sep).join('/'))?.[1] }))
  .filter((page): page is { file: string; sourcePath: string } => !!page.sourcePath)
  // the order of the pages decides the index files
  .sort((a, b) => (a.sourcePath < b.sourcePath ? -1 : 1));
if (!pages.length) throw new Error(`No prerendered HTML in ${SERVER_DIR}`);

for (const { file, sourcePath } of pages) {
  const content = await readFile(path.join(SERVER_DIR, file), 'utf8');
  const { errors } = await index.addHTMLFile({ sourcePath, content });
  if (errors.length) throw new Error(errors.join('\n'));
}

const { errors } = await index.writeFiles({ outputPath: 'public/_pagefind' });
if (errors.length) throw new Error(errors.join('\n'));
await pagefind.close();
console.log(`Pagefind indexed ${pages.length} HTML files`);
