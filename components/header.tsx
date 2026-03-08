import type { Route } from 'next';
import Link from 'next/link';

export function Header() {
  const assignmentHref = '/assignment' as Route;
  const gaokaoHref = '/gaokao' as Route;
  const gaokaoSystemHref = '/gaokao-system' as Route;
  const growthV2Href = '/growth-v2' as Route;
  const petHref = '/pet' as Route;
  const difficultyGradingHref = '/gaokao-system/difficulty-grading' as Route;
  const roadmapHref = '/roadmap' as Route;
  const resourcesHref = '/resources' as Route;
  const adminVideosHref = '/admin/videos' as Route;
  const showAdminEntry = process.env.NODE_ENV === 'production';

  return (
    <header className="sticky top-0 z-50 border-b border-[#ddd8e0] bg-[rgba(249,248,250,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-stretch px-4 sm:px-6 lg:px-8" style={{ height: 56 }}>
        <Link href="/" className="mr-8 flex items-center gap-2 text-ink no-underline">
          <span className="font-['Noto_Serif_SC',serif] text-base font-bold tracking-wide">筑学</span>
          <span className="text-xs text-[#9f96ab]">· 高中数学</span>
        </Link>
        <nav className="flex items-stretch gap-0 overflow-x-auto">
          {[
            { href: '/courses?grade=10', label: '同步课程' },
            { href: gaokaoHref, label: '真题专区' },
            { href: gaokaoSystemHref, label: '提分专区' },
            { href: growthV2Href, label: '成长追踪' },
            { href: petHref, label: '班级宠物' },
            { href: difficultyGradingHref, label: '难度分级' },
            { href: roadmapHref, label: '学习路径' },
            { href: resourcesHref, label: '资料库' },
            { href: '/courses', label: '全部内容' },
            { href: assignmentHref, label: '作业方案' },
            ...(showAdminEntry ? [{ href: adminVideosHref, label: '视频后台' }] : []),
            { href: '/about', label: '关于我' }
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href as Route}
              className="relative flex items-center px-4 text-xs font-medium tracking-wide text-[#9f96ab] transition-colors hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
