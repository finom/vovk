import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/blog/announcement');

export default function Image() {
  return ogImage('/blog/announcement');
}
