import type { Route } from 'next';
import Link from 'next/link';

import { createGrowthExamAction } from '@/app/admin/growth-v2/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2ExamBatchForm, type GrowthV2ExamFormGroup, type GrowthV2ExamFormStudent } from '@/components/growth-v2/exam-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthExamListItem, GrowthGroup, GrowthStudentListItem, GrowthTagCatalogItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthExams, listGrowthGroups, listGrowthStudents, listGrowthTagCatalog } from '@/lib/growth-v2-store';

type GrowthV2ExamsPageProps = {
  searchParams?: {
    error?: string | string[];
    q?: string | string[];
    groupId?: string | string[];
    examType?: string | string[];
    saved?: string | string[];
    deleted?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNumber(value: number | null, digits = 1) {
  return value === null ? '--' : value.toFixed(digits);
}

function formatPercent(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)}%`;
}

const examTypeLabels = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
} as const;

export const dynamic = 'force-dynamic';

export default async function GrowthV2ExamsPage({ searchParams }: GrowthV2ExamsPageProps) {
  const error = firstValue(searchParams?.error);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const examTypeValue = firstValue(searchParams?.examType)?.trim() ?? 'all';
  const examType = examTypeValue === 'school' || examTypeValue === 'internal' || examTypeValue === 'other' ? examTypeValue : 'all';
  const saved = firstValue(searchParams?.saved) === '1';
  const deleted = firstValue(searchParams?.deleted) === '1';
  const adminHref = '/admin/growth-v2' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/exams',
    searchError: error
  });
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
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">考试模块</h1>
              <p className="mt-2 text-sm text-ink/70">考试页已经接到真实数据层，但当前 Supabase 里还没有 Growth V2 相关表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/exams" />
            </div>
          </div>

          <div className="mt-5">
            <GrowthV2AdminErrorBanner error="missing-table" />
          </div>
        </div>
      );
    }

    throw fetchError;
  }

  const totalScores = exams.reduce((sum, exam) => sum + exam.scoreCount, 0);
  const avgScoreRateValues = exams.flatMap((exam) => (exam.avgScoreRate === null ? [] : [exam.avgScoreRate]));
  const overallScoreRate = avgScoreRateValues.length ? avgScoreRateValues.reduce((sum, value) => sum + value, 0) / avgScoreRateValues.length : null;
  const totalTaggedHotspots = exams.reduce((sum, exam) => sum + exam.topTags.length, 0);
  const activeGroups: GrowthV2ExamFormGroup[] = groups
    .filter((group) => group.status === 'active')
    .map((group) => ({
      id: group.id,
      name: group.name,
      gradeLabel: group.gradeLabel
    }));
  const activeStudents: GrowthV2ExamFormStudent[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    homeGroupId: student.homeGroupId
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">考试模块</h1>
          <p className="mt-2 text-sm text-ink/70">这一页现在直接读取 `growth_exams`、`growth_exam_scores` 和 `growth_exam_score_tags`。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回后台
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2/exams" />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            请至少填写班组、考试名称、考试日期、类型和满分；数字字段也要保证合法。
          </p>
        ) : null}
        {saved ? <p className="mt-3 rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">考试记录已保存。</p> : null}
        {deleted ? <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-700">考试记录已删除。</p> : null}
      </div>

      <section className="mt-8">
        <GrowthV2ExamBatchForm groups={activeGroups} students={activeStudents} tagCatalog={tagCatalog} action={createGrowthExamAction} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">考试数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{exams.length}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">成绩记录数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{totalScores}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均得分率</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatPercent(overallScoreRate)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">热点薄弱点条目</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{totalTaggedHotspots}</p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">考试列表</h2>
            <p className="mt-2 text-sm text-ink/70">支持按考试名、班组和类型筛选。后续会在这个页面上继续补录入和分析报告能力。</p>
          </div>
          <p className="text-sm text-ink/65">当前匹配 {exams.length} 场考试</p>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-tide/10 bg-paper/50 p-4 md:grid-cols-[1.1fr_240px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="按考试名称搜索，例如 月考"
            className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select name="groupId" defaultValue={groupId} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">全部班组</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <select name="examType" defaultValue={examType} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="all">全部类型</option>
            <option value="school">学校考试</option>
            <option value="internal">工作室测验</option>
            <option value="other">其他</option>
          </select>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
            筛选
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">考试</th>
                <th className="px-4 py-3 font-medium">班组</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">科目 / 满分</th>
                <th className="px-4 py-3 font-medium">成绩人数</th>
                <th className="px-4 py-3 font-medium">平均分</th>
                <th className="px-4 py-3 font-medium">平均得分率</th>
                <th className="px-4 py-3 font-medium">高频薄弱点</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">{exam.examDate}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{exam.name}</p>
                      {exam.notes ? <p className="mt-1 text-xs text-ink/55">{exam.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{exam.group?.name ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{examTypeLabels[exam.examType]}</td>
                    <td className="px-4 py-4 text-ink/80">
                      <p>{exam.subject}</p>
                      <p className="mt-1 text-xs text-ink/55">满分：{exam.totalScore}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{exam.scoreCount}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(exam.avgScore)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatPercent(exam.avgScoreRate)}</td>
                    <td className="px-4 py-4">
                      {exam.topTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {exam.topTags.map((tag) => (
                            <span key={`${exam.id}-${tag.tagName}`} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                              {tag.tagName} · {tag.count}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink/55">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/growth-v2/exams/${exam.id}` as Route} className="text-sm font-medium text-accent hover:underline">
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-ink/60">
                    没有找到符合条件的考试记录。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
