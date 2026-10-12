import { isBlogPost, SITE, SITE_NAME, sectionOf, urlOf } from '@/lib/site';

interface PageData {
  route: string;
  title: string;
  description: string;
  published?: string;
  modified?: string;
}

const website = { '@id': `${SITE}/#website` };
const author = { '@type': 'Person', name: 'Andrey Gubanov', url: 'https://github.com/finom' };

// Schema.org data for search engines, as the text of a JSON-LD script: the site and the project on the home page,
// the page itself and its breadcrumb trail on every other page. "<" is escaped so the text cannot close the script tag.
export function jsonLd({ route, title, description, published, modified }: PageData) {
  const url = urlOf(route);
  const section = sectionOf(route);
  const trail: (readonly [string, string])[] = [[SITE_NAME, '/'], ...(section ? [section] : []), [title, route]];
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, item], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: urlOf(item),
    })),
  };
  const page =
    route === '/blog'
      ? { '@type': 'Blog', name: `${SITE_NAME} Blog`, url, description, isPartOf: website }
      : {
          '@type': isBlogPost(route) ? 'BlogPosting' : 'TechArticle',
          headline: title,
          description,
          url,
          mainEntityOfPage: url,
          inLanguage: 'en',
          ...(published && { datePublished: published }),
          ...(modified && { dateModified: modified }),
          author,
          isPartOf: website,
        };
  const graph =
    route === '/'
      ? [
          { ...website, '@type': 'WebSite', name: SITE_NAME, url, description, inLanguage: 'en' },
          {
            '@type': 'SoftwareSourceCode',
            name: SITE_NAME,
            description,
            url,
            codeRepository: 'https://github.com/finom/vovk',
            programmingLanguage: 'TypeScript',
            license: 'https://github.com/finom/vovk/blob/main/LICENSE',
            author,
          },
        ]
      : [page, breadcrumb];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}
