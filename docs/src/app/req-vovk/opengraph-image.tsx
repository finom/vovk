import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/req-vovk');

export default function Image() {
  return ogImage('/req-vovk');
}
