import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'VayBooks - Business Management Software',
  description: 'Complete business management solution for retail and wholesale',
  keywords: 'business, management, retail, wholesale, inventory, accounting',
  authors: [{ name: 'VayBooks Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <div id="app-root" className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
