import type { Route } from 'next';
import Link from 'next/link';

import { createGrowthExamAction } from '@/app/admin/growth-v2/actions';
import { GrowthV2ExamBatchForm, type GrowthV2ExamFormGroup, type GrowthV2ExamFormStudent } from '@/components/growth-v2/exam-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import type { GrowthExamListItem, GrowthGroup, GrowthStudentListItem, GrowthTagCatalogItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthExams, listGrowthGroups, listGrowthStudents, listGrowthTagCatalog } from '@/lib/growth-v2-store';

type PageProps = {
  searchParams?: { error?: string | string[]; q?: string | string[]; groupId?: string | string[]; examType?: string | string[]; saved?: string | string[]; deleted?: string | string[] };
};

function firstValue(v?: string | string[]) { return Array.isArray(v) ? v[0] : v; }
function fmtPct(v: number | null) { return v === null ? '--' : `${v.toFixed(1)}%`; }
function fmt(v: number | null, d = 1) { return v === null ? '--' : v.toFixed(d); }

const examTypeLabels: Record<string, string> = { school: '学校考试', internal: '工作室测验', other: '其他' };

export const dynamic = 'force-dynamic';

export default async function ExamsPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const examTypeValue = firstValue(searchParams?.examType)?.trim() ?? 'all';
  const examType = examTypeValue === 'school' || examTypeValue === 'internal' || examTypeValue === 'other' ? examTypeValue : 'all';
  const saved = firstValue(searchParams?.saved) === '1';
  const deleted = firstValue(searchParams?.deleted) === '1';

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/exams', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let exams: GrowthExamListItem[] = [];
  let students: GrowthStudentListItem[] = [];
  let tagCatalog: GrowthTagCatalogItem[] = [];

  try {
    [groups, exams, students, tagCatalog] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthExams({ q, groupId, examType }),
      listGrowthStudents({ status: 'active' }),
      listGrowthTagCatalog()
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const totalScores = exams.reduce((sum, e) => sum + e.scoreCount, 0);
  const rateValues = exams.flatMap((e) => (e.avgScoreRate === null ? [] : [e.avgScoreRate]));
  const overallRate = rateValues.length ? rateValues.reduce((a, b) => a + b, 0) / rateValues.length : null;

  const activeGroups: GrowthV2ExamFormGroup[] = groups.filter((g) => g.status === 'active').map((g) => ({ id: g.id, name: g.name, gradeLabel: g.gradeLabel }));
  const activeStudents: GrowthV2ExamFormStudent[] = students.map((s) => ({ id: s.id, name: s.name, gradeLabel: s.gradeLabel, homeGroupId: s.homeGroupId }));

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />
      {error === 'validation' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">请至少填写班组、考试名称、日期、类型和满分。</p> : null}
      {saved ? <p className="mb-3 rounded-lg border border-stat-emerald/30 bg-stat-emerald-soft px-3 py-2 text-sm text-stat-emerald">考试记录已保存。</p> : null}
      {deleted ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">考试记录已删除。</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">考试管理</h1>
        <Link href={'/admin/growth-v2/tags' as Route} className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-light transition hover:bg-surface-alt">
          管理标签目录
        </Link>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="考试数" value={String(exams.length)} sub="考试场次" colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="成绩记录" value={String(totalScores)} sub="学生成绩条数" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="平均得分率" value={fmtPct(overallRate)} sub="全部考试" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="标签数" value={String(tagCatalog.length)} sub="可用薄弱点标签" colorClass="bg-stat-rose-soft" valueColorClass="text-stat-rose" />
      </section>

      <section className="mt-10">
        <SectionTitle title="新建考试记录" />
        <p className="mt-2 text-sm text-text-light">当前可选学生 {activeStudents.length} 人，已启用标签 {tagCatalog.length} 个。</p>
        <div className="mt-4">
          <GrowthV2ExamBatchForm groups={activeGroups} students={activeStudents} tagCatalog={tagCatalog} action={createGrowthExamAction} />
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle title="考试列表" />
        <form className="mt-4 rounded-xl border border-border-light bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_auto]">
            <input type="text" name="q" defaultValue={q} placeholder="按考试名称搜索" className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
            <select name="groupId" defaultValue={groupId} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="">全部班组</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select name="examType" defaultValue={examType} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="all">全部类型</option>
              <option value="school">学校考试</option>
              <option value="internal">工作室测验</option>
              <option value="other">其他</option>
            </select>
            <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">筛选</button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                <th className="px-4 py-3">日期</th>
                <th className="px-4 py-3">考试</th>
                <th className="px-4 py-3">班组</th>
                <th className="px-4 py-3">类型</th>
                <th className="px-4 py-3">人数</th>
                <th className="px-4 py-3">平均分</th>
                <th className="px-4 py-3">得分率</th>
                <th className="px-4 py-3">薄弱点</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? exams.map((e, i) => (
                <tr key={e.id} className={`border-b border-border-light last:border-b-0 ${i % 2 === 1 ? 'bg-tide/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5 text-text-light">{e.examDate}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-ink">{e.name}</p>
                    <p className="text-xs text-text-muted">{e.subject} · 满分{e.totalScore}</p>
                  </td>
                  <td className="px-4 py-3.5 text-text-light">{e.group?.name ?? '--'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${e.examType === 'school' ? 'bg-tide/10 text-tide' : 'bg-stat-rose-soft text-stat-rose'}`}>
                      {examTypeLabels[e.examType] ?? e.examType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-light">{e.scoreCount}</td>
                  <td className="px-4 py-3.5 text-text-light">{fmt(e.avgScore)}</td>
                  <td className="px-4 py-3.5 text-text-light">{fmtPct(e.avgScoreRate)}</td>
                  <td className="px-4 py-3.5">
                    {e.topTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {e.topTags.map((t) => <span key={`${e.id}-${t.tagName}`} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{t.tagName}·{t.count}</span>)}
                      </div>
                    ) : <span className="text-text-muted">--</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/growth-v2/exams/${e.id}` as Route} className="text-sm font-medium text-tide hover:underline">编辑</Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted">没有找到符合条件的考试记录。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
