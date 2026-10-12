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
    height: 630,
  },
  contentType: 'image/png',
};

// Paper, ink and one vermilion, in hex: Satori takes no oklch.
const PAPER = '#F2F0EB';
const INK = '#111111';
const MUTED = '#5F5D58';
const RULE = '#D8D4CC';
const VERMILION = '#DD4115';

export default function ExampleOg({ title }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '60px 72px',
        background: PAPER,
        color: INK,
        fontFamily: 'Geist',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 34, letterSpacing: -2.04 }}
        >
          <span style={{ color: VERMILION }}>[[...</span>
          <span>vovk</span>
          <span style={{ color: VERMILION }}>]]</span>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 19, fontWeight: 500, color: MUTED }}>Examples</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
        <div style={{ fontSize: 80, fontWeight: 600, letterSpacing: -2.4, lineHeight: 1.08 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: -0.6, color: MUTED }}>
          Back-end framework for Next.js App Router
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${RULE}`,
          paddingTop: 22,
          fontFamily: 'JetBrains Mono',
          fontSize: 19,
          fontWeight: 500,
        }}
      >
        <span style={{ color: VERMILION }}>{'→ '}</span>
        examples.vovk.dev
      </div>
    </div>
  );
}

const font = (file: string) => readFile(path.join(process.cwd(), 'fonts', file));

export const getOgFonts = async () => ({
  fonts: [
    { name: 'Geist', data: await font('Geist-Medium.ttf'), weight: 500, style: 'normal' },
    { name: 'Geist', data: await font('Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: await font('JetBrainsMono-Medium.ttf'), weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: await font('JetBrainsMono-ExtraBold.ttf'), weight: 800, style: 'normal' },
  ] as ImageResponseOptions['fonts'],
});
