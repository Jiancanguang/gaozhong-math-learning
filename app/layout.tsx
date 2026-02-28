import type { Metadata } from 'next';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

import './globals.css';

const siteName = '高中数学教学主页';
const siteDescription = '同步课程、真题讲解与系统提分方法，帮助学生看得懂、做得出、能复盘。';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    siteName,
    type: 'website',
    locale: 'zh_CN'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <div className="relative min-h-screen overflow-x-hidden bg-hero">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
