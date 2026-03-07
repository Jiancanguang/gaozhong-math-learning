import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import { GROWTH_V2_ADMIN_MODULES } from '@/lib/growth-v2';
import { getGrowthV2AdminSnapshot, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type PageProps = { searchParams?: { error?: string | string[] } };

function firstValue(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2',
    searchError: error,
    description: '输入后台口令后，即可进入 Growth V2 的老师后台和各模块入口。'
  });
  if (gate) return gate;

  let snapshot = { groupCount: 0, studentCount: 0, lessonCount: 0, examCount: 0 };

  try {
    snapshot = await getGrowthV2AdminSnapshot();
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div>
          <GrowthV2AdminErrorBanner error="missing-table" />
          <section className="mt-6 rounded-2xl border border-border-light bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">下一步</h2>
            <ol className="mt-4 grid gap-3 text-sm text-text-light">
              <li className="rounded-xl border border-border-light bg-surface-alt p-4">先在 Supabase 执行 `docs/growth-v2-schema.sql`。</li>
              <li className="rounded-xl border border-border-light bg-surface-alt p-4">再从原浏览器导出 IndexedDB JSON。</li>
              <li className="rounded-xl border border-border-light bg-surface-alt p-4">最后运行 `npm run growth:v2:import -- --dir /your/export/dir --dry-run`。</li>
            </ol>
          </section>
        </div>
      );
    }
    throw fetchError;
  }

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">数据概览</h1>
        <AdminLogoutButton redirectPath="/admin/growth-v2" />
      </div>

      {/* Stat Cards */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="班组总数" value={String(snapshot.groupCount)} sub="活跃班组" colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="学生总数" value={String(snapshot.studentCount)} sub="在读学生" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="累计课程" value={String(snapshot.lessonCount)} sub="课堂记录" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="考试次数" value={String(snapshot.examCount)} sub="考试记录" colorClass="bg-stat-rose-soft" valueColorClass="text-stat-rose" />
      </section>

      {/* Module Cards */}
      <section className="mt-10">
        <SectionTitle title="功能模块" />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GROWTH_V2_ADMIN_MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href as Route}
              className="group rounded-2xl border border-border-light bg-surface p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-ink group-hover:text-tide">{mod.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-light">{mod.summary}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-tide">
                进入 →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
