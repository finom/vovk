export const SITE = 'https://vovk.dev';
export const SITE_NAME = 'Vovk.ts';

// The folders whose pages carry the folder in their breadcrumb trail.
const SECTIONS: Record<string, string> = { blog: 'Blog', 'realtime-ui': 'Realtime Kanban' };

// The route of an MDX page from its path: `src/app/blog/v4/page.mdx` → `/blog/v4`.
export const routeOf = (filePath: string) => `/${filePath.replace(/^src\/app\/|\/?page\.mdx$/g, '')}`;

// GitHub Pages serves `out/x.html` at `/x` and answers 404 at `/x/`, so only the home page ends with a slash.
export const urlOf = (route: string) => (route === '/' ? `${SITE}/` : SITE + route);

export const isBlogPost = (route: string) => route.startsWith('/blog/');

// The section a page belongs to by its first folder, or undefined for a docs page.
export const sectionNameOf = (route: string) => {
  const folder = route.split('/')[1];
  return Object.hasOwn(SECTIONS, folder) ? SECTIONS[folder] : undefined;
};

// The section a nested page sits in, as [name, route].
export const sectionOf = (route: string) => {
  const folder = route.split('/')[1];
  return route !== `/${folder}` && folder in SECTIONS ? ([SECTIONS[folder], `/${folder}`] as const) : undefined;
};
