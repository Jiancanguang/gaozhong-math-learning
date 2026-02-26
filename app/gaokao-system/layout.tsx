import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '系统提分专区',
  description: '面向高中生的系统提分框架、执行策略与工具模板。'
};

const navItems = [
  { label: '首页', href: '/gaokao-system' as Route },
  { label: '信息架构', href: '/gaokao-system/architecture' as Route },
  { label: '系统框架', href: '/gaokao-system/framework' as Route },
  { label: '诊断评估', href: '/gaokao-system/diagnosis' as Route },
  { label: '方法库', href: '/gaokao-system/methods' as Route },
  { label: '学科突破', href: '/gaokao-system/subjects' as Route },
  { label: '30天计划', href: '/gaokao-system/30days' as Route },
  { label: '工具中心', href: '/gaokao-system/tools' as Route }
];

export default function GaokaoSystemLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div
        className="gaokao-system-theme"
        style={{
          fontFamily: "'PingFang SC','Hiragino Sans GB','Microsoft YaHei','Noto Sans SC',sans-serif"
        }}
      >
        <section className="gs-card p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--gs-accent)]">System Score Boosting</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--gs-primary)] sm:text-4xl">高中系统提分专区</h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--gs-muted)]">
          这是一套独立于原课程站的提分内容分区，聚焦框架、执行流程和工具模板，不影响你现有课程页面结构。
          </p>
          <nav className="mt-5 flex flex-wrap gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-[var(--gs-line)] bg-white px-3 py-1.5 font-medium text-[var(--gs-primary)] transition hover:bg-[rgba(15,109,140,0.08)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
