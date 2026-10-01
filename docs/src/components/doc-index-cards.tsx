import type { MetaRecord } from 'nextra';
import { Cards } from 'nextra/components';
import type { ReactElement } from 'react';

interface Props {
  meta: MetaRecord;
  icons: Record<string, ReactElement>;
  hrefPrefix?: string;
}

const DocIndexCards = ({ meta, icons, hrefPrefix }: Props) => {
  return (
    <Cards>
      {Object.entries(meta)
        .filter(([, value]) => {
          return (
            typeof value === 'string' || (typeof value === 'object' && 'type' in value && value.type !== 'separator')
          );
        })
        .map(([key, value]) => (
          <Cards.Card
            key={key}
            title={
              typeof value === 'string'
                ? value
                : 'title' in value
                  ? ((value.title as string) ?? 'No title')
                  : 'No title'
            }
            href={`/${[hrefPrefix, key].filter(Boolean).join('/')}`}
            icon={icons[key]}
          />
        ))}
    </Cards>
  );
};

export default DocIndexCards;
