import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/query-provider';
import RealTimeDemo from '@/components/real-time-demo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https:/kanban.vovk.dev'),
  title: {
    default: 'Vovk.ts - Realtime Kanban',
    template: '%s | Vovk.ts - Realtime Kanban',
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RealTimeDemo />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
