/** biome-ignore-all lint/performance/noImgElement: ignore */
import { ImageResponse } from 'next/og';
// import { getPost } from '@/app/lib/data'

// Image metadata
export const size = {
  width: 1200,
  height: 630,
};

export const dynamic = 'force-static';

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 50,
        // background: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'black',
        color: 'white',
        backgroundImage: 'url(https://vovk.dev/og-pattern.png)',
      }}
    >
      <img style={{ marginTop: 60 }} src="https://vovk.dev/vovk-logo-white.svg" width="65%" alt="Vovk.ts" />
      <p style={{ marginTop: 60 }}>Backend Framework for Next.js App Router</p>
      <p style={{ marginTop: 0 }}>Next.js • RPC • TypeScript</p>
    </div>
  );
}
