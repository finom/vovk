import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { frontMatter, pageTitle } from '../../src/lib/page-source';
import { transformContent } from './contextTransforms.js';

const APP_DIR = path.join(process.cwd(), 'src/app');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const BASE_URL = 'https://vovk.dev';

// The docs for LLMs, each as Markdown (the first URLs, kept for existing links) and as text: GitHub Pages sends a
// `.md` file as text/markdown, which some fetchers refuse, and a `.txt` file as text/plain.
const FILES = {
  docs: { md: 'context/docs.md', txt: 'llms-full.txt' },
  realtimeUi: { md: 'context/realtime-ui.md', txt: 'context/realtime-ui.txt' },
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadMeta(dir: string): Promise<Record<string, unknown> | null> {
  for (const ext of ['.tsx', '.ts']) {
    const metaPath = path.join(dir, `_meta${ext}`);
    if (await fileExists(metaPath)) {
      const mod = await import(pathToFileURL(metaPath).href);
      return mod.default;
    }
  }
  return null;
}

function isReactElement(value: unknown): boolean {
  return typeof value === 'object' && value !== null && '$$typeof' in value;
}

function isSeparator(value: unknown): value is { type: 'separator'; title: string } {
  return typeof value === 'object' && value !== null && (value as Record<string, unknown>).type === 'separator';
}

function shouldSkip(key: string, value: unknown): boolean {
  if (key.startsWith('#')) return true;

  if (typeof value === 'object' && value !== null && !isReactElement(value)) {
    const obj = value as Record<string, unknown>;
    if (obj.type === 'page' || obj.type === 'separator') return true;
    if (typeof obj.href === 'string' && obj.href.startsWith('http')) return true;
  }

  return false;
}

interface Page {
  url: string;
  title: string;
  description: string;
  section: string;
  content: string;
}

async function readPage(pagePath: string, route: string, section: string): Promise<Page> {
  const raw = await readFile(pagePath, 'utf8');
  console.log(`  Added: ${route} (${path.relative(APP_DIR, pagePath)})`);
  return {
    url: route === '/' ? BASE_URL : `${BASE_URL}${route}`,
    title: pageTitle(raw),
    description: frontMatter(raw).description ?? '',
    section,
    content: transformContent(raw),
  };
}

// The pages of a folder's `_meta`, in sidebar order. A separator starts a section.
async function processDirectory(dir: string, urlPrefix: string, section: string): Promise<Page[]> {
  const meta = await loadMeta(dir);
  if (!meta) return [];

  const pages: Page[] = [];

  for (const [key, value] of Object.entries(meta)) {
    if (isSeparator(value)) section = value.title.replace(/^[^\p{L}\p{N}]+/u, '');
    if (shouldSkip(key, value)) continue;

    const pageDir = key === 'index' ? dir : path.join(dir, key);
    const pagePath = path.join(pageDir, 'page.mdx');
    const route = key === 'index' ? urlPrefix || '/' : `${urlPrefix}/${key}`;

    if (await fileExists(pagePath)) {
      pages.push(await readPage(pagePath, route, section));
    } else {
      console.warn(`  Warning: ${pagePath} not found, skipping`);
    }

    if (key !== 'index') pages.push(...(await processDirectory(pageDir, route, section)));
  }

  return pages;
}

function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

function buildFile(
  title: string,
  description: string,
  crossLinkLabel: string,
  crossLinkUrl: string,
  pages: Page[]
): string {
  const body = pages.map((p) => `Page: ${p.url}\n\n${p.content}`).join('\n\n---\n\n');

  // Build YAML header, then compute stats including the header itself
  const buildHeader = (chars: number, tokens: number) =>
    `---\ntitle: "${title}"\ndescription: "${description}"\nsee_also:\n  label: "${crossLinkLabel}"\n  url: ${crossLinkUrl}\nchars: ${chars}\nest_tokens: ${tokens}\n---\n\n`;

  // First pass: estimate header size to get accurate char count
  const draftHeader = buildHeader(0, 0);
  const draftContent = draftHeader + body;
  const chars = draftContent.length;
  const tokens = estimateTokens(chars);

  // Second pass: build with actual stats
  const header = buildHeader(chars, tokens);
  return header + body;
}

// The llms.txt index (llmstxt.org): every page with its description, in sidebar sections.
function buildIndex(home: Page, pages: Page[]): string {
  const sections = new Map<string, string[]>();
  for (const { url, title, description, section } of pages) {
    sections.set(section, [...(sections.get(section) ?? []), `- [${title}](${url}): ${description}`]);
  }
  return [
    '# Vovk.ts',
    `> ${home.description}`,
    `The docs pages in one text file: ${BASE_URL}/${FILES.docs.txt}. The Realtime Kanban series in another: ${BASE_URL}/${FILES.realtimeUi.txt}.`,
    ...Array.from(sections, ([section, links]) => `## ${section}\n\n${links.join('\n')}`),
    '',
  ].join('\n\n');
}

async function main() {
  console.log('Generating context files...');

  await mkdir(path.join(PUBLIC_DIR, 'context'), { recursive: true });

  const pages = await processDirectory(APP_DIR, '', 'Docs');
  const inSeries = (page: Page) => page.url.startsWith(`${BASE_URL}/realtime-ui`);
  const docsPages = pages.filter((page) => !inSeries(page));
  const realtimeUiPages = pages.filter(inSeries);
  const posts = (await processDirectory(path.join(APP_DIR, 'blog'), '/blog', 'Blog')).filter(
    (page) => page.url !== `${BASE_URL}/blog`
  );

  for (const ext of ['md', 'txt'] as const) {
    const docs = buildFile(
      'Vovk.ts Documentation Context',
      'Full documentation for the Vovk.ts framework, excluding the Realtime Kanban tutorial.',
      'Realtime Kanban Context',
      `${BASE_URL}/${FILES.realtimeUi[ext]}`,
      docsPages
    );
    const realtimeUi = buildFile(
      'Vovk.ts Realtime Kanban Context',
      'Walkthrough of the Realtime Kanban example app — a live-updating UI with Vovk.ts and AI features.',
      'Vovk.ts Docs Context',
      `${BASE_URL}/${FILES.docs[ext]}`,
      realtimeUiPages
    );
    await writeFile(path.join(PUBLIC_DIR, FILES.docs[ext]), docs, 'utf8');
    await writeFile(path.join(PUBLIC_DIR, FILES.realtimeUi[ext]), realtimeUi, 'utf8');
    console.log(`  ${FILES.docs[ext]}: ${(docs.length / 1024).toFixed(1)} KB`);
    console.log(`  ${FILES.realtimeUi[ext]}: ${(realtimeUi.length / 1024).toFixed(1)} KB`);
  }

  // The series index stays under Examples, as in the sidebar; its pages get a section of their own.
  const [home, ...rest] = pages;
  const listed = rest.map((page) =>
    inSeries(page) && page.url !== `${BASE_URL}/realtime-ui` ? { ...page, section: 'Realtime Kanban' } : page
  );
  await writeFile(path.join(PUBLIC_DIR, 'llms.txt'), buildIndex(home, [...listed, ...posts]), 'utf8');

  console.log(
    `\nDone! ${docsPages.length} docs pages, ${realtimeUiPages.length} Realtime Kanban pages, ${posts.length} posts.`
  );
}

main().catch((err) => {
  console.error('Failed to generate context files:', err);
  process.exit(1);
});
