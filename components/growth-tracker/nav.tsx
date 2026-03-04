'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: '总览' },
  { href: '/record', label: '课堂录入' },
  { href: '/students', label: '学生管理' },
  { href: '/history', label: '历史记录' }
] as const;

export function GrowthTrackerNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gt-primary/10 bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="mr-4 py-3 text-lg font-semibold text-gt-primary" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          筑学工作室
        </Link>
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href as never}
              className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'border-gt-accent text-gt-primary'
                  : 'border-transparent text-ink/60 hover:border-gt-primary/20 hover:text-gt-primary'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="flex-1" />
        <form action="/auth/actions" method="POST">
          <button
            type="button"
            onClick={async () => {
              const { logoutAction } = await import('@/app/auth/actions');
              await logoutAction();
            }}
            className="rounded-lg border border-gt-primary/20 px-3 py-1.5 text-xs text-ink/60 transition hover:border-gt-accent/40 hover:text-gt-primary"
          >
            退出
          </button>
        </form>
      </div>
    </nav>
  );
}
