import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';

type GrowthV2ExamsPageProps = {
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const deliverables = ['考试主表录入', '批量录入学生分数与排名', '掌握度等级录入', '薄弱点标签选择', '生成考试分析报告与图表'];

export const dynamic = 'force-dynamic';

export default function GrowthV2ExamsPage({ searchParams }: GrowthV2ExamsPageProps) {
  const error = firstValue(searchParams?.error);
  const adminHref = '/admin/growth-v2' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/exams',
    searchError: error
  });
  if (gate) return gate;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">考试模块</h1>
          <p className="mt-2 text-sm text-ink/70">这一页后面会接 `growth_exams`、`growth_exam_scores` 和 `growth_exam_score_tags`。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回后台
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2/exams" />
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <h2 className="text-xl font-semibold text-tide">这一页会落地的功能</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {deliverables.map((item) => (
            <article key={item} className="rounded-xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
              {item}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
