import './globals.css';
import localFont from 'next/font/local';
import { Providers } from '../contexts/Providers';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { PageContainer } from '@/components/PageContainer';
import { Footer } from '@/components/Footer';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="green">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <PageContainer>
            {children}
            <Toaster />
            <Footer />
          </PageContainer>
        </Providers>
      </body>
    </html>
  );
}
