import type { Route } from 'next';
import Link from 'next/link';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { Pagination } from '@/components/growth-v2/ui/pagination';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import { firstValue, fmt, fmtPct, fmtTime } from '@/lib/growth-v2-format';
import type { GrowthGroup } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthLessons } from '@/lib/growth-v2-store';

type PageProps = {
  searchParams?: { error?: string | string[]; q?: string | string[]; groupId?: string | string[]; page?: string | string[]; saved?: string | string[]; deleted?: string | string[] };
};

export const dynamic = 'force-dynamic';

export default async function LessonsPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const page = Math.max(1, parseInt(firstValue(searchParams?.page) ?? '1', 10) || 1);
  const saved = firstValue(searchParams?.saved) === '1';
  const deleted = firstValue(searchParams?.deleted) === '1';

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/lessons', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let lessonResult = { items: [] as Awaited<ReturnType<typeof listGrowthLessons>>['items'], total: 0, page: 1, pageSize: 20 };

  try {
    [groups, lessonResult] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthLessons({ q, groupId, page })
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const lessons = lessonResult.items;
  const totalRecords = lessons.reduce((sum, l) => sum + l.recordCount, 0);
  const exitRates = lessons.flatMap((l) => (l.avgExitScoreRate === null ? [] : [l.avgExitScoreRate]));
  const perfValues = lessons.flatMap((l) => (l.avgPerformance === null ? [] : [l.avgPerformance]));
  const overallExitRate = exitRates.length ? exitRates.reduce((a, b) => a + b, 0) / exitRates.length : null;
  const overallPerf = perfValues.length ? perfValues.reduce((a, b) => a + b, 0) / perfValues.length : null;

  function buildPageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (groupId) params.set('groupId', groupId);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/admin/growth-v2/lessons?${qs}` : '/admin/growth-v2/lessons';
  }

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />
      {saved ? <p className="mb-3 rounded-lg border border-stat-emerald/30 bg-stat-emerald-soft px-3 py-2 text-sm text-stat-emerald">课堂记录已保存。</p> : null}
      {deleted ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">课堂记录已删除。</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">课堂记录</h1>
        <Link href={'/admin/growth-v2/lessons/new' as Route} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
          + 新建课堂
        </Link>
      </div>

      {/* Stat Cards */}
      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="课堂总数" value={String(lessonResult.total)} sub="课堂记录" colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="本页记录" value={String(totalRecords)} sub="学生记录条数" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="平均课后得分率" value={fmtPct(overallExitRate)} sub="本页课次" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="平均课堂表现" value={fmt(overallPerf)} sub="本页课次" colorClass="bg-stat-rose-soft" valueColorClass="text-stat-rose" />
      </section>

      {/* Lesson List */}
      <section className="mt-10">
        <SectionTitle title="课堂列表" />
        <form className="mt-4 rounded-xl border border-border-light bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
            <input type="text" name="q" defaultValue={q} placeholder="按课堂主题搜索" className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
            <select name="groupId" defaultValue={groupId} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="">全部班组</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">筛选</button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                <th className="px-4 py-3">日期</th>
                <th className="px-4 py-3">主题</th>
                <th className="px-4 py-3">班组</th>
                <th className="px-4 py-3">学生</th>
                <th className="px-4 py-3">进门考均分</th>
                <th className="px-4 py-3">课后得分率</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? lessons.map((l, i) => (
                <tr key={l.id} className={`border-b border-border-light last:border-b-0 ${i % 2 === 1 ? 'bg-tide/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5 text-text-light">
                    <p>{l.lessonDate}</p>
                    <p className="text-xs text-text-muted">{fmtTime(l.timeStart, l.timeEnd)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-ink">{l.topic}</p>
                    {l.homework ? <p className="mt-0.5 text-xs text-text-muted">作业：{l.homework}</p> : null}
                  </td>
                  <td className="px-4 py-3.5 text-text-light">{l.group?.name ?? '--'}</td>
                  <td className="px-4 py-3.5 text-text-light">{l.recordCount}{l.guestCount > 0 ? <span className="ml-1 text-xs text-text-muted">(+{l.guestCount}调课)</span> : null}</td>
                  <td className="px-4 py-3.5 text-text-light">{fmt(l.avgEntryScore)}</td>
                  <td className="px-4 py-3.5 text-text-light">{fmtPct(l.avgExitScoreRate)}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/growth-v2/lessons/${l.id}` as Route} className="text-sm font-medium text-tide hover:underline">编辑</Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">没有找到符合条件的课堂记录。</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={lessonResult.page} pageSize={lessonResult.pageSize} total={lessonResult.total} buildHref={buildPageHref} />
      </section>
    </div>
  );
}
