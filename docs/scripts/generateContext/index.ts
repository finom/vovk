import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { transformContent } from './contextTransforms.js';

const APP_DIR = path.join(process.cwd(), 'src/app');
const OUTPUT_DIR = path.join(process.cwd(), 'public/context');
const BASE_URL = 'https://vovk.dev';

const DOCS_URL = `${BASE_URL}/context/docs.md`;
const REALTIME_UI_URL = `${BASE_URL}/context/realtime-ui.md`;

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

function getTitle(key: string, value: unknown): string {
  if (typeof value === 'string') return value;
  if (isReactElement(value)) {
    const props = (value as Record<string, unknown>).props as Record<string, unknown> | undefined;
    if (props && typeof props.children === 'string') return props.children;
  }
  if (typeof value === 'object' && value !== null && 'title' in (value as Record<string, unknown>)) {
    const title = (value as Record<string, unknown>).title;
    if (typeof title === 'string') return title;
  }
  return key;
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
  content: string;
}

async function processDirectory(dir: string, urlPrefix = ''): Promise<Page[]> {
  const meta = await loadMeta(dir);
  if (!meta) return [];

  const pages: Page[] = [];

  for (const [key, value] of Object.entries(meta)) {
    if (shouldSkip(key, value)) continue;

    const pagePath = key === 'index' ? path.join(dir, 'page.mdx') : path.join(dir, key, 'page.mdx');
    const pageDir = key === 'index' ? dir : path.join(dir, key);
    const pageUrl = key === 'index' ? urlPrefix || '/' : `${urlPrefix}/${key}`;

    if (await fileExists(pagePath)) {
      const raw = await readFile(pagePath, 'utf8');
      const content = transformContent(raw);
      const title = getTitle(key, value);
      console.log(`  Added: ${title} (${path.relative(APP_DIR, pagePath)})`);
      pages.push({
        url: pageUrl === '/' ? BASE_URL : `${BASE_URL}${pageUrl}`,
        content,
      });
    } else {
      console.warn(`  Warning: ${pagePath} not found, skipping`);
    }

    if (key !== 'index') {
      const nestedPages = await processDirectory(pageDir, `${urlPrefix}/${key}`);
      pages.push(...nestedPages);
    }
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

async function main() {
  console.log('Generating context files...');

  await mkdir(OUTPUT_DIR, { recursive: true });

  // Process root meta, separate realtime-ui from the rest
  const rootMeta = await loadMeta(APP_DIR);
  if (!rootMeta) throw new Error('Root _meta not found');

  const docsPages: Page[] = [];
  const realtimeUiPages: Page[] = [];

  for (const [key, value] of Object.entries(rootMeta)) {
    if (shouldSkip(key, value)) continue;

    // Realtime Kanban sub-section goes to its own file
    if (key === 'realtime-ui') {
      // The realtime-ui index page
      const pagePath = path.join(APP_DIR, key, 'page.mdx');
      if (await fileExists(pagePath)) {
        const raw = await readFile(pagePath, 'utf8');
        const content = transformContent(raw);
        const title = getTitle(key, value);
        console.log(`  Added: ${title} (${path.relative(APP_DIR, pagePath)})`);
        realtimeUiPages.push({ url: `${BASE_URL}/realtime-ui`, content });
      }
      // Recurse into realtime-ui sub-pages
      const nested = await processDirectory(path.join(APP_DIR, key), '/realtime-ui');
      realtimeUiPages.push(...nested);
      continue;
    }

    const pagePath = key === 'index' ? path.join(APP_DIR, 'page.mdx') : path.join(APP_DIR, key, 'page.mdx');
    const pageUrl = key === 'index' ? BASE_URL : `${BASE_URL}/${key}`;

    if (await fileExists(pagePath)) {
      const raw = await readFile(pagePath, 'utf8');
      const content = transformContent(raw);
      const title = getTitle(key, value);
      console.log(`  Added: ${title} (${path.relative(APP_DIR, pagePath)})`);
      docsPages.push({ url: pageUrl, content });
    } else {
      console.warn(`  Warning: ${pagePath} not found, skipping`);
    }

    // Recurse into any sub-sections (except realtime-ui, handled above)
    if (key !== 'index') {
      const nested = await processDirectory(path.join(APP_DIR, key), `/${key}`);
      docsPages.push(...nested);
    }
  }

  const docsOutput = buildFile(
    'Vovk.ts Documentation Context',
    'Full documentation for the Vovk.ts framework, excluding the Realtime Kanban tutorial.',
    'Realtime Kanban Context',
    REALTIME_UI_URL,
    docsPages
  );
  const realtimeOutput = buildFile(
    'Vovk.ts Realtime Kanban Context',
    'Walkthrough of the Realtime Kanban example app — a live-updating UI with Vovk.ts and AI features.',
    'Vovk.ts Docs Context',
    DOCS_URL,
    realtimeUiPages
  );

  await writeFile(path.join(OUTPUT_DIR, 'docs.md'), docsOutput, 'utf8');
  await writeFile(path.join(OUTPUT_DIR, 'realtime-ui.md'), realtimeOutput, 'utf8');

  console.log(`\nDone!`);
  console.log(`  docs.md: ${docsPages.length} pages, ${(docsOutput.length / 1024).toFixed(1)} KB`);
  console.log(`  realtime-ui.md: ${realtimeUiPages.length} pages, ${(realtimeOutput.length / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error('Failed to generate context files:', err);
  process.exit(1);
});
