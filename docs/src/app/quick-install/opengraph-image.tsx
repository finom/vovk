import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/quick-install');

export default function Image() {
  return ogImage('/quick-install');
}
