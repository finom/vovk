import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/realtime-ui/run');

export default function Image() {
  return ogImage('/realtime-ui/run');
}
