import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ImageResponseOptions } from 'next/server.js';

interface Props {
  title: string;
}

export const constants = {
  alt: 'Vovk.ts',
  size: {
    width: 1200,
    height: 600,
  },
  contentType: 'image/png',
};

export default function ExampleOg({ title }: Props) {
  const logoSize = 2.5;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        gap: '0',
        paddingTop: '20px',
        paddingBottom: '10px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'black',
        backgroundImage: 'url(https://vovk.dev/og-pattern.png)',
        backgroundSize: '48px 48px',
      }}
    >
      {/** biome-ignore lint/performance/noImgElement: ignore */}
      <img
        src={`https://vovk.dev/vovk-logo-white.svg`}
        alt=""
        width={320 * logoSize}
        height={92 * logoSize}
        style={{ marginBottom: '0px' }}
      />
      <h1
        style={{
          color: '#fff',
          opacity: 0.6,
          fontSize: '60px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '60px',
          fontFamily: 'InterSemibold, sans-serif',
        }}
      >
        {' '}
        Back-end Framework for Next.js App Router
      </h1>
      <p
        style={{
          opacity: 0.8,
          fontSize: '75px',
          textAlign: 'center',
          marginBottom: '0px',
          color: '#fff',
          fontFamily: 'InterSemibold, sans-serif',
        }}
      >
        {title}
      </p>
    </div>
  );
}

export const getOgFonts = async () => ({
  fonts: [
    {
      name: 'InterSemibold',
      data: await readFile(path.join(process.cwd(), 'fonts/Inter-SemiBold-og-subset.ttf')),
      style: 'normal',
      weight: 400,
    },
    /* {
      name: 'Inter',
      data: await (
        await fetch(new URL(`../../fonts/Inter/static/Inter_24pt-Light.ttf`, import.meta.url))
      ).arrayBuffer(),
      style: 'normal',
      weight: 400,
    }, */
  ] as ImageResponseOptions['fonts'],
});
