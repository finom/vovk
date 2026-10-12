import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/jsonlines');

export default function Image() {
  return ogImage('/jsonlines');
}
