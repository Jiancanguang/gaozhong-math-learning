'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '总览', href: '/admin/growth-v2' },
  { label: '录入', href: '/admin/growth-v2/lessons' },
  { label: '学生', href: '/admin/growth-v2/students' },
  { label: '成绩', href: '/admin/growth-v2/exams' },
  { label: '记录', href: '/admin/growth-v2/tags' }
];

export default function AdminGrowthV2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin/growth-v2') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-border-light bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link href="/admin/growth-v2" className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-tide">筑学</span>
            <span className="text-sm text-text-muted">· 学生成长追踪</span>
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={`relative px-4 py-4 text-sm font-medium transition ${
                  isActive(item.href)
                    ? 'text-tide'
                    : 'text-text-light hover:text-tide'
                }`}
              >
                {item.label}
                {isActive(item.href) ? (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-tide" />
                ) : null}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
