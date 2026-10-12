import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/static-segment');

export default function Image() {
  return ogImage('/static-segment');
}
