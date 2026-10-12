import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { frontMatter, pageTitle } from '@/lib/page-source';
import { sectionNameOf } from '@/lib/site';

// The Open Graph card of every page, in the [[...vovk]] style. Satori draws it: flexbox only, hex colors only.

const SIZE = { width: 1200, height: 630 };
const PAPER = '#F2F0EB';
const INK = '#111111';
const MUTED = '#5F5D58';
const RULE = '#D8D4CC';
const VERMILION = '#DD4115';
const PADDING_X = 72;

const font = (file: string) => readFile(path.join(process.cwd(), 'src/og/fonts', file));

const fonts = async () =>
  [
    { name: 'Geist', data: await font('Geist-Medium.ttf'), weight: 500, style: 'normal' },
    { name: 'Geist', data: await font('Geist-SemiBold.ttf'), weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: await font('JetBrainsMono-Medium.ttf'), weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: await font('JetBrainsMono-ExtraBold.ttf'), weight: 800, style: 'normal' },
  ] as const;

// The page's own text, from the front matter of src/app/<route>/page.mdx.
function pageText(route: string) {
  const mdx = readFileSync(path.join(process.cwd(), 'src/app', route, 'page.mdx'), 'utf8');
  const { description, date } = frontMatter(mdx);
  return { title: pageTitle(mdx), description, date };
}

// The largest title size that fits two lines, or three below 80px. Geist SemiBold averages about 0.53em a character;
// the 1.1 leaves room for word wrapping.
function titleSize(title: string) {
  const width = SIZE.width - 2 * PADDING_X;
  const steps = [
    [96, 2],
    [80, 2],
    [68, 3],
    [58, 3],
    [50, 3],
  ] as const;
  return steps.find(([size, lines]) => title.length * 0.53 * size * 1.1 <= width * lines)?.[0] ?? 44;
}

const Wordmark = ({ size, style }: { size: number; style?: React.CSSProperties }) => (
  <div
    style={{
      display: 'flex',
      fontFamily: 'JetBrains Mono',
      fontWeight: 800,
      fontSize: size,
      letterSpacing: -0.06 * size,
      lineHeight: 1,
      color: INK,
      ...style,
    }}
  >
    <span style={{ color: VERMILION }}>[[...</span>
    <span>vovk</span>
    <span style={{ color: VERMILION }}>]]</span>
  </div>
);

const Arrow = () => <span style={{ color: VERMILION }}>{'→ '}</span>;

const frame = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: `60px ${PADDING_X}px`,
  background: PAPER,
  color: INK,
  fontFamily: 'Geist',
} as const;

const footer = {
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: `1px solid ${RULE}`,
  paddingTop: 22,
  fontFamily: 'JetBrains Mono',
  fontSize: 19,
  fontWeight: 500,
} as const;

// The home card: the og-image composition of the design.
const HomeCard = () => (
  <div style={frame}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.84 }}>Vovk.ts</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 19, fontWeight: 500, color: MUTED }}>vovk.dev</div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30 }}>
      <Wordmark size={150} style={{ marginLeft: -8, lineHeight: 0.95 }} />
      <div style={{ fontSize: 42, fontWeight: 500, letterSpacing: -1.05, lineHeight: 1.1 }}>
        Back-end framework for Next.js App Router
      </div>
    </div>
    <div style={{ ...footer, justifyContent: 'flex-start', gap: 26 }}>
      {['Route Handler', 'RPC client', '.fn()', 'OpenAPI', 'AI tools'].map((item) => (
        <div key={item} style={{ display: 'flex' }}>
          <Arrow />
          {item}
        </div>
      ))}
    </div>
  </div>
);

const PageCard = ({ route }: { route: string }) => {
  const { title, description, date } = pageText(route);
  const size = titleSize(title);
  return (
    <div style={frame}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size={34} />
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 19, fontWeight: 500, color: MUTED }}>
          {sectionNameOf(route) ?? 'Docs'}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
        <div style={{ fontSize: size, fontWeight: 600, letterSpacing: -0.03 * size, lineHeight: 1.08 }}>{title}</div>
        {description && (
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.28, lineHeight: 1.35, color: MUTED }}>
            {description}
          </div>
        )}
      </div>
      <div style={footer}>
        <div style={{ display: 'flex' }}>
          <Arrow />
          {`vovk.dev${route}`}
        </div>
        {date && <div style={{ color: MUTED }}>{date}</div>}
      </div>
    </div>
  );
};

// For an opengraph-image.tsx: one image with the id `og.png`, so the static export writes a .png file that GitHub
// Pages serves as image/png.
export function ogImageMetadata(route: string) {
  const title = route === '/' ? 'Back-end framework for Next.js App Router' : pageText(route).title;
  const alt = title.includes('Vovk.ts') ? title : `Vovk.ts: ${title}`;
  return [{ id: 'og.png', alt, size: SIZE, contentType: 'image/png' }];
}

export async function ogImage(route: string) {
  return new ImageResponse(route === '/' ? <HomeCard /> : <PageCard route={route} />, {
    ...SIZE,
    fonts: [...(await fonts())],
  });
}
