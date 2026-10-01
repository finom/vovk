import { Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import type { Metadata } from 'next';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './globals.css';
import VovkLogo from '@/components/vovk-logo.tsx';

export const metadata: Metadata = {
  metadataBase: new URL('https://examples.vovk.dev'),
  title: {
    template: '%s | Vovk.ts examples',
    default: 'Vovk.ts examples',
  },
  description: 'Vovk.ts examples',
  icons: {
    icon: [
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
  },
};

const navbar = (
  <Navbar
    logo={<VovkLogo width={120} />}
    // ... Your additional navbar options
  />
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
    >
      <Head
        // Warm clay accent (replaces Nextra's default purple) plus cream / warm
        // charcoal page backgrounds, matched to the oklch palette in globals.css.
        color={{
          hue: { light: 18, dark: 20 },
          saturation: { light: 55, dark: 60 },
          lightness: { light: 50, dark: 62 },
        }}
        backgroundColor={{ light: '#f5f3ec', dark: '#1e1d1b' }}
      >
        {/*
          Editorial type system — Inter (body/UI), Fraunces (display headings),
          JetBrains Mono (code) — loaded from Google Fonts. We link the
          stylesheet directly rather than via `next/font/google` because this app
          uses `moduleResolution: nodenext`, under which those font types don't
          resolve at build time. Family names are wired to CSS vars in globals.css.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
        />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
