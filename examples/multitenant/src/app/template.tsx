'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-loading-skeleton/dist/skeleton.css';

import './globals.css';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
