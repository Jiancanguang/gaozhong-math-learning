import type { Route } from 'next';
import Link from 'next/link';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import { firstValue } from '@/lib/growth-v2-format';
import type { GrowthExamListItem, GrowthGroup, GrowthLessonListItem, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthExams, listGrowthGroups, listGrowthLessons, listGrowthStudents } from '@/lib/growth-v2-store';

type PageProps = { searchParams?: { error?: string | string[]; saved?: string | string[]; status?: string | string[]; q?: string | string[] } };
type GroupSummary = GrowthGroup & { studentCount: number; lessonCount: number; examCount: number };

function buildSummaries(groups: GrowthGroup[], students: GrowthStudentListItem[], lessons: GrowthLessonListItem[], exams: GrowthExamListItem[]) {
  const sc = new Map<string, number>();
  const lc = new Map<string, number>();
  const ec = new Map<string, number>();
  for (const s of students) { if (s.homeGroupId) sc.set(s.homeGroupId, (sc.get(s.homeGroupId) ?? 0) + 1); }
  for (const l of lessons) lc.set(l.groupId, (lc.get(l.groupId) ?? 0) + 1);
  for (const e of exams) ec.set(e.groupId, (ec.get(e.groupId) ?? 0) + 1);
  return groups.map((g) => ({ ...g, studentCount: sc.get(g.id) ?? 0, lessonCount: lc.get(g.id) ?? 0, examCount: ec.get(g.id) ?? 0 }));
}

export const dynamic = 'force-dynamic';

export default async function GroupsPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const savedGroupId = firstValue(searchParams?.saved);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';
  const status = statusValue === 'active' || statusValue === 'archived' ? statusValue : 'all';

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/groups', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];
  let lessons: GrowthLessonListItem[] = [];
  let exams: GrowthExamListItem[] = [];

  try {
    [groups, students, lessons, exams] = await Promise.all([
      listGrowthGroups({ status }),
      listGrowthStudents({ status: 'all' }),
      listGrowthLessons(),
      listGrowthExams()
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const filtered = groups.filter((g) => {
    if (!q) return true;
    return [g.name, g.teacherName, g.gradeLabel, g.notes].join('\n').toLowerCase().includes(q.toLowerCase());
  });
  const summaries = buildSummaries(filtered, students, lessons, exams);
  const activeCount = summaries.filter((g) => g.status === 'active').length;

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />
      {error === 'validation' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">请至少填写班组名称。</p> : null}
      {error === 'duplicate' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">班组名称不能重复。</p> : null}
      {savedGroupId ? <p className="mb-3 rounded-lg border border-stat-emerald/30 bg-stat-emerald-soft px-3 py-2 text-sm text-stat-emerald">班组信息已保存。</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">班组管理</h1>
        <Link href={'/admin/growth-v2/groups/new' as Route} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
          + 新建班组
        </Link>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="班组总数" value={String(summaries.length)} sub="全部班组" colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="启用中" value={String(activeCount)} sub="活跃班组" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="已归档" value={String(summaries.length - activeCount)} sub="归档班组" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="覆盖老师" value={String(new Set(summaries.map((g) => g.teacherName).filter(Boolean)).size)} sub="不同老师" colorClass="bg-stat-rose-soft" valueColorClass="text-stat-rose" />
      </section>

      <section className="mt-10">
        <SectionTitle title="班组列表" />
        <form className="mt-4 rounded-xl border border-border-light bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_150px_auto]">
            <input type="text" name="q" defaultValue={q} placeholder="按班组名、老师搜索" className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
            <select name="status" defaultValue={status} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="all">全部状态</option>
              <option value="active">启用中</option>
              <option value="archived">已归档</option>
            </select>
            <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">筛选</button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                <th className="px-4 py-3">班组</th>
                <th className="px-4 py-3">年级</th>
                <th className="px-4 py-3">老师</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">学生</th>
                <th className="px-4 py-3">课堂</th>
                <th className="px-4 py-3">考试</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {summaries.length > 0 ? summaries.map((g, i) => (
                <tr key={g.id} className={`border-b border-border-light last:border-b-0 ${i % 2 === 1 ? 'bg-tide/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5 font-medium text-ink">{g.name}</td>
                  <td className="px-4 py-3.5 text-text-light">{g.gradeLabel || '--'}</td>
                  <td className="px-4 py-3.5 text-text-light">{g.teacherName || '--'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${g.status === 'active' ? 'bg-stat-emerald-soft text-stat-emerald' : 'bg-surface-alt text-text-muted'}`}>
                      {g.status === 'active' ? '启用中' : '已归档'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-light">{g.studentCount}</td>
                  <td className="px-4 py-3.5 text-text-light">{g.lessonCount}</td>
                  <td className="px-4 py-3.5 text-text-light">{g.examCount}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/admin/growth-v2/groups/${g.id}/edit` as Route} className="rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-medium text-tide hover:bg-tide/20">编辑</Link>
                      <Link href={`/admin/growth-v2/students?groupId=${g.id}` as Route} className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-light hover:bg-border-light">学生</Link>
                      <Link href={`/admin/growth-v2/lessons?groupId=${g.id}` as Route} className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-light hover:bg-border-light">课堂</Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">没有匹配的班组。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
