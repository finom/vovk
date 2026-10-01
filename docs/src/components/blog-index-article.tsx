import { Link } from 'nextra-theme-docs';
import { Badge } from '@/components/ui/badge';
// @ts-nocheck
interface Props {
  type?: 'external' | 'internal';
  href: string;
  title: string;
  description: string;
  date?: string;
  badge?: string;
}

const BlogIndexArticle = ({ type, href, title, description, date, badge }: Props) => {
  const isExternal = href.startsWith('http');
  const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <div className="mb-10">
      <Link
        // @ts-expect-error
        href={href}
        style={{ color: 'inherit', textDecoration: 'none' }}
        className="block font-semibold mt-8 text-2xl"
        {...linkProps}
      >
        {type === 'external' ? '🔗 ' : ''}
        {title}
        {badge ? (
          <Badge variant="outline" className="ml-2 align-middle text-xs font-normal">
            {badge}
          </Badge>
        ) : null}
      </Link>
      <p className="opacity-80" style={{ marginTop: '.5rem' }}>
        {description}{' '}
        <span className="block mt-2 text-sm">
          <Link
            // @ts-expect-error
            href={href}
            {...linkProps}
          >
            {'Read more →'}
          </Link>
        </span>
      </p>
      {date ? <p className="opacity-50 text-sm mt-2">{date}</p> : null}
    </div>
  );
};

export default BlogIndexArticle;
