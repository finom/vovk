import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/blog/v4');

export default function Image() {
  return ogImage('/blog/v4');
}
