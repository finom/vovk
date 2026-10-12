import type { MDXComponents } from 'mdx/types';
import type { MDXWrapper } from 'nextra';
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';
import { isBlogPost, routeOf, urlOf } from '@/lib/site';
import { jsonLd } from '@/lib/structured-data';

// A post's `date` front matter, such as "October 12, 2026", as an ISO date.
const isoDate = (date: unknown) =>
  typeof date === 'string' && !Number.isNaN(Date.parse(`${date} UTC`))
    ? new Date(`${date} UTC`).toISOString().slice(0, 10)
    : undefined;

// Each page's address, Open Graph type and structured data. React moves the link and meta tags into <head>; the root
// layout sets the rest of the metadata.
const Wrapper: MDXWrapper = (props) => {
  const { wrapper: ThemeWrapper = ({ children }) => children } = getThemeComponents();
  const { filePath, title, description, timestamp } = props.metadata;
  const route = routeOf(filePath);
  const post = isBlogPost(route);
  const published = post ? isoDate((props.metadata as { date?: unknown }).date) : undefined;
  const modified = timestamp ? new Date(timestamp).toISOString() : undefined;
  return (
    <>
      <link rel="canonical" href={urlOf(route)} />
      <meta property="og:url" content={urlOf(route)} />
      <meta property="og:type" content={post ? 'article' : 'website'} />
      {published && <meta property="article:published_time" content={published} />}
      {post && modified && <meta property="article:modified_time" content={modified} />}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: our own JSON, escaped by `jsonLd`
        dangerouslySetInnerHTML={{
          __html: jsonLd({ route, title, description: description ?? '', published, modified }),
        }}
      />
      <ThemeWrapper {...props} />
    </>
  );
};

// Read per call, not copied at module scope: a hot reload can leave a module-scope copy pointing at stale components.
export function useMDXComponents(components?: MDXComponents) {
  return { ...getThemeComponents(), wrapper: Wrapper, ...components };
}
