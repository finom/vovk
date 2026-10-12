import { Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import type { Metadata } from 'next';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './globals.css';
import VovkLogo, { VovkMark } from '@/components/vovk-logo.tsx';

export const metadata: Metadata = {
  metadataBase: new URL('https://examples.vovk.dev'),
  title: {
    template: '%s | Vovk.ts examples',
    default: 'Vovk.ts examples',
  },
  description: 'Vovk.ts examples',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/icon-white.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
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
        // Vermilion links on white and on #111111. The light one is darker than the logo's so that small text keeps 4.5:1.
        color={{
          hue: { light: 13, dark: 12 },
          saturation: { light: 90, dark: 91 },
          lightness: { light: 40, dark: 60 },
        }}
        backgroundColor={{ light: '#FFFFFF', dark: '#111111' }}
      >
        {/*
          Geist for text and Geist Mono for code, from Google Fonts: next/font/google's types
          don't resolve under this app's `moduleResolution: nodenext`. globals.css names the families.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
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
