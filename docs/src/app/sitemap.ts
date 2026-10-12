import type { MetadataRoute } from 'next';
import type { MdxFile, PageMapItem } from 'nextra';
import { getPageMap } from 'nextra/page-map';
import { urlOf } from '@/lib/site';

export const dynamic = 'force-static';

// A folder whose page sets `asIndexPage` carries that page's front matter itself.
const pages = (items: PageMapItem[]): MdxFile[] =>
  items.flatMap((item) => [
    ...('frontMatter' in item ? [item as MdxFile] : []),
    ...('children' in item ? pages(item.children) : []),
  ]);

// Every MDX page, dated by its last commit: nextra reads the time from git into the page map.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return pages(await getPageMap()).map(({ route, frontMatter }) => ({
    url: urlOf(route),
    lastModified: frontMatter?.timestamp ? new Date(frontMatter.timestamp) : undefined,
  }));
}
