import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/decorator-overview');

export default function Image() {
  return ogImage('/decorator-overview');
}
