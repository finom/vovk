import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/agent-ready');

export default function Image() {
  return ogImage('/agent-ready');
}
