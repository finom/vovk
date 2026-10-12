import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/procedure');

export default function Image() {
  return ogImage('/procedure');
}
