import type { Metadata } from 'next';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: '数学教学主页',
    template: '%s | 数学教学主页'
  },
  description: '数学个人教学网站，聚焦高一下同步课程与高三高考真题讲解。',
  openGraph: {
    title: '数学教学主页',
    description: '高一下同步课程 + 高三高考真题讲解',
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
