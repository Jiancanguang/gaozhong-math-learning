import type { Route } from 'next';
import Link from 'next/link';

import { GROWTH_V2_NEXT_STEPS, GROWTH_V2_PUBLIC_HIGHLIGHTS, GROWTH_V2_TABLES } from '@/lib/growth-v2';

const migrationStatus = [
  { title: '结构方案', detail: '已完成：功能清单、表设计、迁移映射。' },
  { title: '数据库结构', detail: '已完成：growth-v2 schema 已执行到 Supabase。' },
  { title: '历史数据', detail: '已完成：离线版 IndexedDB 数据已导入 growth_* 新表。' },
  { title: '页面连通', detail: '已完成：学生、课堂、考试后台页和家长报告页都已接上真实读取。' },
  { title: '学生维护', detail: '已完成第一版：学生新建、编辑、详情和家长页 token 管理都已接好。' },
  { title: '后台录入', detail: '已完成第一版：课堂批量录入、考试批量录入都能直接写入 Supabase。' },
  { title: '历史维护', detail: '已完成第一版：课堂详情页、考试详情页都支持回看和修改。' }
];

export default function GrowthV2Page() {
  const adminHref = '/admin/growth-v2' as Route;
  const demoParentHref = '/growth-v2/parent/demo-token' as Route;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">这一版会替换什么</h2>
          <p className="mt-2 text-sm text-ink/75">Growth V2 不再只追踪总分和排名，而是把线下成熟版里真正有用的成长记录能力迁到线上。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GROWTH_V2_PUBLIC_HIGHLIGHTS.map((item) => (
              <span key={item} className="rounded-full bg-tide/10 px-3 py-1 text-xs font-medium text-tide">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={adminHref} className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
              打开 Growth V2 后台
            </Link>
            <Link href={demoParentHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
              查看家长页示例
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">当前状态</h2>
          <div className="mt-4 space-y-3">
            {migrationStatus.map((item) => (
              <div key={item.title} className="rounded-xl border border-tide/10 bg-paper/60 p-4">
                <p className="text-sm font-semibold text-tide">{item.title}</p>
                <p className="mt-1 text-sm text-ink/75">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">下一步实施顺序</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {GROWTH_V2_NEXT_STEPS.map((item, index) => (
              <li key={item} className="rounded-xl border border-tide/10 bg-paper/50 p-4 text-sm text-ink/80">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-tide text-xs text-white">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/85 p-6">
          <h2 className="text-2xl font-semibold text-tide">V2 表清单</h2>
          <div className="mt-4 space-y-2">
            {GROWTH_V2_TABLES.map((tableName) => (
              <p key={tableName} className="rounded-lg border border-tide/10 bg-paper/60 px-3 py-2 font-mono text-xs text-tide">
                {tableName}
              </p>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink/70">SQL 草案在仓库的 `docs/growth-v2-schema.sql`，对应 migration 也已经落库。</p>
          <p className="mt-4 text-sm text-ink/70">当前 Growth V2 已经能读写真实学生、课堂、考试和家长报告数据，不再只是页面骨架。</p>
        </article>
      </section>
    </div>
  );
}
