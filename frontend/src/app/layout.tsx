import './globals.css';
import localFont from 'next/font/local';
import { Providers } from '../contexts/Providers';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { PageContainer } from '@/components/PageContainer';
import { Footer } from '@/components/Footer';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { Suspense } from 'react';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata = {
  title: 'Woolies Watcher',
  description: 'Track price updates of Woolworths Items',
  icons: {
    icon: '/images/favicon.ico?v=4',
    apple: '/images/apple-touch-icon.png',
    shortcut: '/images/favicon-32x32.png',
    other: [
      { rel: 'manifest', url: '/images/site.webmanifest' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/images/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/images/android-chrome-512x512.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={<LoadingIndicator />}>
            <Navbar />
            <PageContainer>
              {children}
              <Toaster />
              <Footer />
            </PageContainer>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
