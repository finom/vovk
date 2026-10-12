import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/manual-install');

export default function Image() {
  return ogImage('/manual-install');
}
