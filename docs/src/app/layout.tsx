import { Footer, Layout, Link, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import '@/globals.css';
import VovkLogo from '@/components/vovk-logo';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

// Warm, editorial type system: a clean grotesque for body/UI, a soft serif for
// display headings, and a crisp mono for code. Exposed as CSS variables so the
// Nextra theme (--x-font-sans / --x-font-mono) and our heading styles in
// globals.css can pick them up.
const fontSans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fontDisplay = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://vovk.dev'),
  manifest: '/site.webmanifest',
  title: {
    default: 'Vovk.ts - Back-end Framework for Next.js App Router',
    template: '%s | Vovk.ts - Back-end Framework for Next.js App Router',
  },
  openGraph: {
    url: 'https://vovk.dev',
    siteName: 'Vovk.ts',
    locale: 'en_US',
    type: 'website',
    description: 'One codebase → type-safe clients, OpenAPI, and AI tools',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      {
        media: '(prefers-color-scheme: light)',
        url: '/icon.svg',
        href: '/icon.svg',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/icon-white.svg',
        href: '/icon-white.svg',
      },
    ],
    apple: '/apple-touch-icon.png',
  },
};

const navbar = (
  <Navbar
    logo={<VovkLogo width={120} />}
    projectLink="https://github.com/finom/vovk"
    chatLink="https://discord.com/invite/qdT8WEHUuP"
    // ... Your additional navbar options
  >
    <a href="https://x.com/vovkts" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" className="inline">
        <title>Vovk.ts on X</title>
        <g>
          <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
        </g>
      </svg>
    </a>
  </Navbar>
);
const footer = (
  <Footer className="justify-between">
    <div>
      MIT © 2023-{new Date().getFullYear()}{' '}
      <Link href="https://github.com/finom" className="ml-1">
        Andrey Gubanov
      </Link>
    </div>
    <div className="flex gap-4 items-center">
      <Link href="https://github.com/sponsors/finom" target="_blank" className="block">
        Sponsor
      </Link>
    </div>
  </Footer>
);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <Head
        // Warm clay accent (replaces Nextra's default blue) plus cream / warm
        // charcoal page backgrounds, matched to the oklch palette in globals.css.
        color={{
          hue: { light: 18, dark: 20 },
          saturation: { light: 55, dark: 60 },
          lightness: { light: 50, dark: 62 },
        }}
        backgroundColor={{ light: '#f5f3ec', dark: '#1e1d1b' }}
      />
      <body>
        <Layout
          /* banner={
            <Banner storageKey="initial-announcement">
              <Link href="/blog/announcement" className="text-white font-medium no-underline">
                🐺 Vovk.ts is released. Read the blog post →
              </Link>
            </Banner>
          } */
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/finom/vovk/tree/main/docs"
          footer={footer}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
