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

const moduleVisualMap: Record<
  (typeof GROWTH_V2_ADMIN_MODULES)[number]['title'],
  {
    eyebrow: string;
    accentClassName: string;
    quickPoints: string[];
  }
> = {
  班组管理: {
    eyebrow: 'Groups',
    accentClassName: 'bg-sky/15 text-tide',
    quickPoints: ['班组配置', '老师与年级', '沉淀统计']
  },
  标签目录: {
    eyebrow: 'Tags',
    accentClassName: 'bg-accent/10 text-accent',
    quickPoints: ['分类排序', '启停状态', '引用次数']
  },
  学生档案: {
    eyebrow: 'Students',
    accentClassName: 'bg-[#d4f2ea] text-[#00b894]',
    quickPoints: ['新建编辑', '家长 Token', '学习轨迹']
  },
  课堂记录: {
    eyebrow: 'Lessons',
    accentClassName: 'bg-tide/10 text-tide',
    quickPoints: ['批量录入', '历史编辑', '删除确认']
  },
  考试管理: {
    eyebrow: 'Exams',
    accentClassName: 'bg-paper text-accent ring-1 ring-accent/15',
    quickPoints: ['成绩录入', '薄弱点标签', '删除确认']
  }
};

const operatingHighlights = [
  '所有数据已经落在 `growth_*` 新表，不会碰旧版成绩追踪表。',
  '线下版历史数据已经导入，当前看到的是实际班组、学生、课堂和考试数据。',
  '后台现在可以直接做班组、标签、学生、课堂和考试维护，不只是展示页。'
] as const;

export const dynamic = 'force-dynamic';

export default async function GrowthV2AdminPage({ searchParams }: GrowthV2AdminPageProps) {
  const error = firstValue(searchParams?.error);
  const publicHref = '/growth-v2' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2',
    searchError: error,
    description: '输入后台口令后，即可进入 Growth V2 的老师后台和各模块入口。'
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
              <h1 className="mt-2 text-3xl font-semibold text-tide">老师后台</h1>
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
      <div>
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/80 p-8 shadow-card">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Teacher Console</p>
            <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">Growth V2 老师后台</h1>
            <p className="mt-4 max-w-3xl text-base text-ink/80">
              这一套后台已经不是临时原型了。班组、标签、学生、课堂和考试都在用真实 Supabase 数据，你现在可以直接在线维护整套成长追踪流程。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {operatingHighlights.map((item) => (
                <span key={item} className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={publicHref} className="rounded-xl bg-tide px-5 py-3 text-sm font-medium text-white transition hover:bg-tide/90">
                返回公开概览
              </Link>
              <Link href={'/admin/growth-v2/students' as Route} className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">
                先看学生档案
              </Link>
              <Link href={'/score-tracker' as Route} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
                查看旧版迁移页
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2" />
            </div>
          </div>

          <div className="rounded-3xl border border-tide/10 bg-paper/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-tide">当前线上数据规模</h2>
              </div>
              <span className="rounded-full bg-[#d4f2ea] px-3 py-1 text-xs font-semibold text-[#00b894]">已连真实数据</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">班组数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.groupCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">学生数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.studentCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">课堂数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.lessonCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">考试数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{snapshot.examCount}</p>
              </article>
            </div>
            <div className="mt-5 rounded-2xl border border-tide/10 bg-white/80 p-4 text-sm text-ink/75">
              这四个数字直接来自线上 `growth_groups`、`growth_students`、`growth_lessons`、`growth_exams`，不是写死展示。
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-tide">现在可以直接用的模块</h2>
            <p className="mt-2 text-sm text-ink/75">不再是窄卡片入口，而是按实际后台工作流整理成更清晰的模块卡。</p>
          </div>
          <Link href={'/admin/growth-v2/exams' as Route} className="text-sm font-medium text-accent hover:underline">
            去考试管理
          </Link>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {GROWTH_V2_ADMIN_MODULES.map((module) => (
          <article key={module.href} className="rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{moduleVisualMap[module.title].eyebrow}</p>
                <h3 className="mt-2 text-2xl font-semibold text-tide">{module.title}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${moduleVisualMap[module.title].accentClassName}`}>已就位</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink/75">{module.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {moduleVisualMap[module.title].quickPoints.map((point) => (
                <span key={point} className="rounded-full bg-paper px-3 py-1 font-medium text-tide ring-1 ring-tide/10">
                  {point}
                </span>
              ))}
            </div>
            <Link
              href={module.href as Route}
              className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90"
            >
              进入模块
            </Link>
          </article>
        ))}
        </div>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-tide">当前数据流</h2>
              <p className="mt-2 text-sm text-ink/75">这部分保留迁移背景，但不再堆砌脚本说明。</p>
            </div>
            <span className="rounded-full bg-tide/10 px-3 py-1 text-xs font-semibold text-tide">并行上线中</span>
          </div>
          <ol className="mt-5 grid gap-3">
            <li className="rounded-2xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
              `growth_*` 新表已经独立落库，旧版成绩追踪仍然保留，切换风险可控。
            </li>
            <li className="rounded-2xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
              线下 IndexedDB 数据已经迁移完成，当前后台里的数字和列表都是真实数据，不是演示。
            </li>
            <li className="rounded-2xl border border-tide/10 bg-paper/60 p-4 text-sm text-ink/80">
              课堂和考试现在都支持历史编辑、标签维护，以及二次确认删除，已经能承担日常后台工作。
            </li>
          </ol>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-tide">Growth V2 表</h2>
              <p className="mt-2 text-sm text-ink/75">把表清单做成一眼能扫完的结构，而不是长段说明。</p>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{GROWTH_V2_TABLES.length} 张表</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {GROWTH_V2_TABLES.map((tableName) => (
              <p key={tableName} className="rounded-xl border border-tide/10 bg-paper/60 px-4 py-3 font-mono text-sm text-tide">
                {tableName}
              </p>
            ))}
          </div>
          <p className="mt-5 text-sm text-ink/70">这里保留的是你后面维护数据结构时最常用的一层索引，不再把整段 migration 说明直接摊在首页。</p>
        </article>
      </section>
    </div>
  );
}
