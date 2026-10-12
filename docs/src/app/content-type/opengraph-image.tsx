import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/content-type');

export default function Image() {
  return ogImage('/content-type');
}
