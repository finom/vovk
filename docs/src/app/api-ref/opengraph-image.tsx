import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/api-ref');

export default function Image() {
  return ogImage('/api-ref');
}
