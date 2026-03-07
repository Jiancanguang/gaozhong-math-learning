import type { Route } from 'next';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Growth V2',
  description: '成长追踪 V2 的公开说明与老师后台入口。'
};

export default function GrowthV2Layout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const overviewHref = '/growth-v2' as Route;
  const adminHref = '/admin/growth-v2' as Route;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[#ddd8e0] bg-[#f9f8fa] p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Growth Tracking</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-tide">成长追踪系统</h1>
            <p className="mt-2 text-sm text-ink/75">课堂记录、考试记录、掌握度、薄弱点和家长报告统一在一套线上数据模型里。</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href={overviewHref} className="rounded-full border border-tide/15 bg-paper px-4 py-2 text-tide transition hover:border-accent/35 hover:text-accent">
              概览
            </Link>
            <Link href={adminHref} className="rounded-full border border-tide/15 bg-paper px-4 py-2 text-tide transition hover:border-accent/35 hover:text-accent">
              老师后台
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
