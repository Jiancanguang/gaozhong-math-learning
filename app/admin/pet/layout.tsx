'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '班级', href: '/admin/pet' },
  { label: '使用说明', href: '/pet' }
];

export default function AdminPetLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin/pet') return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-border-light bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <Link href="/admin/pet" className="flex items-baseline gap-1">
            <span className="font-serif text-lg font-bold text-tide">筑学</span>
            <span className="text-sm text-text-muted">· 班级宠物</span>
          </Link>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className={`relative px-4 py-4 text-sm font-medium transition ${
                  isActive(item.href) ? 'text-tide' : 'text-text-light hover:text-tide'
                }`}
              >
                {item.label}
                {isActive(item.href) ? <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-tide" /> : null}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
