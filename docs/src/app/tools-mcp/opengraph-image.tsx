import { ogImage, ogImageMetadata } from '@/og/og-card';

export const dynamic = 'force-static';

export const generateImageMetadata = () => ogImageMetadata('/tools-mcp');

export default function Image() {
  return ogImage('/tools-mcp');
}
