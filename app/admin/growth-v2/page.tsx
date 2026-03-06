import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GROWTH_V2_ADMIN_MODULES, GROWTH_V2_TABLES } from '@/lib/growth-v2';
import { getGrowthV2AdminSnapshot, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2AdminPageProps = {
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2AdminPage({ searchParams }: GrowthV2AdminPageProps) {
  const error = firstValue(searchParams?.error);
  const publicHref = '/growth-v2' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2',
    searchError: error,
    description: '输入后台口令后，即可查看 Growth V2 的老师后台骨架和模块入口。'
  });
  if (gate) return gate;

  let snapshot = {
    groupCount: 0,
    studentCount: 0,
    lessonCount: 0,
    examCount: 0
  };

  try {
    snapshot = await getGrowthV2AdminSnapshot();
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth Tracking V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">老师后台骨架</h1>
              <p className="mt-2 text-sm text-ink/70">Growth V2 页面已就位，但数据库 schema 还没有同步到 Supabase。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={publicHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                公开概览
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2" />
            </div>
          </div>

          <div className="mt-5">
            <GrowthV2AdminErrorBanner error="missing-table" />
          </div>

          <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
            <h2 className="text-2xl font-semibold text-tide">下一步</h2>
            <ol className="mt-4 grid gap-3 text-sm text-ink/80">
              <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">先在 Supabase 执行 `docs/growth-v2-schema.sql`。</li>
              <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">再从原浏览器导出 IndexedDB JSON。</li>
              <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">最后运行 `npm run growth:v2:import -- --dir /your/export/dir --dry-run`。</li>
            </ol>
          </section>
        </div>
      );
    }

    throw fetchError;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth Tracking V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">老师后台骨架</h1>
          <p className="mt-2 text-sm text-ink/70">这里先把 V2 的后台结构和入口立起来，后续逐页接真实 Supabase 数据。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={publicHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            公开概览
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2" />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">班组数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.groupCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">学生数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.studentCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">课堂数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.lessonCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">考试数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.examCount}</p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {GROWTH_V2_ADMIN_MODULES.map((module) => (
          <article key={module.href} className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
            <h2 className="text-xl font-semibold text-tide">{module.title}</h2>
            <p className="mt-2 text-sm text-ink/75">{module.summary}</p>
            <Link
              href={module.href as Route}
              className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              进入模块
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-tide">当前已就位的基础设施</h2>
          <ol className="mt-4 grid gap-3 text-sm text-ink/80">
            <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">新表 schema 已独立到 `growth_*`，不会直接撞旧版成绩追踪表。</li>
            <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">`scripts/growth-v2/export-indexeddb.js` 可从原浏览器导出离线版数据。</li>
            <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">`scripts/growth-v2/import-json-to-supabase.mjs` 可把 JSON 导入 Supabase。</li>
            <li className="rounded-xl border border-tide/10 bg-paper/60 p-4">班组 / 学生 / 课堂 / 考试 4 个后台模块都已经有真实读写入口。</li>
          </ol>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-tide">Growth V2 表</h2>
          <div className="mt-4 space-y-2">
            {GROWTH_V2_TABLES.map((tableName) => (
              <p key={tableName} className="rounded-lg border border-tide/10 bg-paper/60 px-3 py-2 font-mono text-xs text-tide">
                {tableName}
              </p>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink/70">执行 SQL 后，再导入历史 JSON，后续每个模块就可以开始接真实查询和保存动作。</p>
        </article>
      </section>
    </div>
  );
}
