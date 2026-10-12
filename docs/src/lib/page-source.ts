// The front matter of an MDX page: the whole lines between the opening and the closing `---`.
const FRONT_MATTER = /^---\n((?:.*\n)*?)---(?:\n|$)/;

export const frontMatterSource = (mdx: string) => mdx.match(FRONT_MATTER)?.[1] ?? '';

// The front matter as `key: value` lines, the value JSON-quoted, single-quoted or bare.
export function frontMatter(mdx: string): Record<string, string> {
  return Object.fromEntries(
    frontMatterSource(mdx)
      .split('\n')
      .flatMap((line) => {
        const [, key, value] = line.match(/^([\w-]+):\s*(.*)$/) ?? [];
        if (!key) return [];
        if (value.startsWith('"')) return [[key, JSON.parse(value) as string]];
        return [[key, value.replace(/^'(.*)'$/, '$1')]];
      })
  );
}

// A page's title as nextra takes it: the front matter title, else the first heading, without code marks.
export function pageTitle(mdx: string) {
  const heading = mdx
    .replace(FRONT_MATTER, '')
    .replace(/```[\s\S]*?```/g, '')
    .match(/^# (.+)$/m)?.[1];
  return frontMatter(mdx).title ?? heading?.replace(/`/g, '').trim() ?? '';
}
