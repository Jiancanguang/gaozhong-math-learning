import type { Route } from 'next';
import Link from 'next/link';

export function Header() {
  const assignmentHref = '/assignment' as Route;

  return (
    <header className="border-b border-tide/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-tide">
          高中数学学习站
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink/80">
          <Link href="/roadmap" className="transition hover:text-accent">
            学习路径图
          </Link>
          <Link href="/courses" className="transition hover:text-accent">
            课程
          </Link>
          <Link href={assignmentHref} className="transition hover:text-accent">
            个性化作业
          </Link>
          <Link href="/about" className="transition hover:text-accent">
            关于与反馈
          </Link>
        </nav>
      </div>
    </header>
  );
}
