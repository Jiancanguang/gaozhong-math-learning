import type { Route } from 'next';
import Link from 'next/link';

export function Header() {
  const assignmentHref = '/assignment' as Route;
  const gaokaoHref = '/gaokao' as Route;
  const roadmapHref = '/roadmap' as Route;
  const adminVideosHref = '/admin/videos' as Route;
  const showAdminEntry = process.env.NODE_ENV === 'production';

  return (
    <header className="border-b border-tide/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-tide">
          数学教学主页
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink/80">
          <Link href="/courses?grade=10" className="transition hover:text-accent">
            高一下同步
          </Link>
          <Link href={gaokaoHref} className="transition hover:text-accent">
            高三真题
          </Link>
          <Link href={roadmapHref} className="transition hover:text-accent">
            学习路径图
          </Link>
          <Link href="/courses" className="transition hover:text-accent">
            课程
          </Link>
          <Link href={assignmentHref} className="transition hover:text-accent">
            个性化作业
          </Link>
          {showAdminEntry ? (
            <Link href={adminVideosHref} className="transition hover:text-accent">
              视频后台
            </Link>
          ) : null}
          <Link href="/about" className="transition hover:text-accent">
            关于与反馈
          </Link>
        </nav>
      </div>
    </header>
  );
}
