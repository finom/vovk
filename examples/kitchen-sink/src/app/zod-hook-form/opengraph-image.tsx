import { ImageResponse } from 'next/og.js';
import ExampleOg, { getOgFonts, constants } from '@/components/example-og.tsx';

export const { alt, size, contentType } = constants;

export const runtime = 'edge';

export default async function OgImage() {
  return new ImageResponse(<ExampleOg title="Zod + React Hook Form example" />, {
    ...size,
    ...(await getOgFonts()),
  });
}
