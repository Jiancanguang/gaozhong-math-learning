import type { Metadata } from 'next';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: '高中数学学习站',
    template: '%s | 高中数学学习站'
  },
  description: '面向高一高二同步学习的数学课程平台，提供短视频讲解、知识点讲义、例题分析与课后小练。',
  openGraph: {
    title: '高中数学学习站',
    description: '高一高二同步数学课程：短视频 + 讲义 + 例题 + 小练',
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
