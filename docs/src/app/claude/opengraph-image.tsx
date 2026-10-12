import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/claude');

export default function Image() {
  return ogImage('/claude');
}
