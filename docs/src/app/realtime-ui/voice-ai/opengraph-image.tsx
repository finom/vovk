import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/realtime-ui/voice-ai');

export default function Image() {
  return ogImage('/realtime-ui/voice-ai');
}
