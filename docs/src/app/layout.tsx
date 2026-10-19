import { Footer, Layout, Link, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import '@/globals.css';
import VovkLogo, { VovkMark } from '@/components/vovk-logo';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';

// Geist for text, Geist Mono for code. globals.css hands them to Nextra. JetBrains Mono for the home page's code orbit.
const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const fontMarks = JetBrains_Mono({ subsets: ['latin'], variable: '--font-marks', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://vovk.dev'),
  manifest: '/site.webmanifest',
  title: {
    default: 'Vovk.ts - Back-end Framework for Next.js App Router',
    template: '%s | Vovk.ts',
  },
  // Each page has its own description, which Open Graph and X take. og:url and og:type come from the MDX wrapper.
  description: 'Back-end framework for Next.js App Router. One codebase gives type-safe clients, OpenAPI and AI tools.',
  openGraph: {
    siteName: 'Vovk.ts',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@andrey_gubanov1',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      // An ink tile on a light browser UI, a white tile on a dark one; icon.svg also switches by itself.
      { url: '/icon.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/icon-white.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

const navbar = (
  <Navbar
    logo={
      // Below 360px the wordmark and the icons don't fit in one row.
      <>
        <VovkLogo width={132} className="max-[360px]:hidden" />
        <VovkMark width={56} className="min-[360px]:hidden" />
      </>
    }
    projectLink="https://github.com/finom/vovk"
    chatLink="https://discord.com/invite/qdT8WEHUuP"
    // ... Your additional navbar options
  >
    <a href="https://x.com/andrey_gubanov1" target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" className="inline">
        <title>Andrey Gubanov on X</title>
        <g>
          <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
        </g>
      </svg>
    </a>
  </Navbar>
);
const FOOTER_LINKS = [
  ['Docs', '/quick-install'],
  ['Agent skills', '/skills'],
  ['Technical overview', '/about'],
  ['GitHub', 'https://github.com/finom/vovk'],
] as const;

const footer = (
  <Footer className="vk-footer">
    <div className="vk-footer-brand">
      <VovkLogo width={104} />
      <span>
        MIT © 2023-{new Date().getFullYear()} <Link href="https://github.com/finom">Andrey Gubanov</Link>
      </span>
    </div>
    <nav aria-label="Footer" className="vk-footer-nav">
      {FOOTER_LINKS.map(([label, href]) => (
        <Link key={href} href={href}>
          {label}
        </Link>
      ))}
    </nav>
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
      className={`${fontSans.variable} ${fontMono.variable} ${fontMarks.variable}`}
    >
      <Head
        // Vermilion links on paper and on near-black, as --vk-accent-text in globals.css.
        color={{
          hue: { light: 11, dark: 12 },
          saturation: { light: 100, dark: 100 },
          lightness: { light: 36, dark: 69 },
        }}
        backgroundColor={{ light: '#F2F0EB', dark: '#141412' }}
      />
      <body>
        <Layout
          /* banner={
            <Banner storageKey="initial-announcement">
              <Link href="/blog/announcement" className="text-white font-medium no-underline">
                [[v]] Vovk.ts is released. Read the blog post →
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
