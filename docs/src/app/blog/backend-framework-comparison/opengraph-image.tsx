import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/blog/backend-framework-comparison');

export default function Image() {
  return ogImage('/blog/backend-framework-comparison');
}
