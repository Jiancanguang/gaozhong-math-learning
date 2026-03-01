import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { ScoreTrackerAdminErrorBanner, renderScoreTrackerAdminGate } from '@/components/score-tracker/admin-access';
import { TrendChart } from '@/components/score-tracker/trend-chart';
import { EXAM_TYPE_LABELS, buildStudentTrendSummary, isScoreTrackerTableMissingError } from '@/lib/score-tracker';
import { describeSubjectDelta, formatRank, formatRankDelta, formatScore, formatScoreDelta, summarizeSubjectScores } from '@/lib/score-tracker-display';

type StudentDetailPageProps = {
  params: {
    studentId: string;
  };
  searchParams?: {
    saved?: string | string[];
    deleted?: string | string[];
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StudentDetailPage({ params, searchParams }: StudentDetailPageProps) {
  const error = firstValue(searchParams?.error);
  const gate = renderScoreTrackerAdminGate({
    successPath: `/admin/score-tracker/students/${params.studentId}`,
    searchError: error
  });
  if (gate) return gate;

  let summary = null;

  try {
    summary = await buildStudentTrendSummary(params.studentId);
  } catch (fetchError) {
    if (isScoreTrackerTableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-tide">学生详情</h1>
              <p className="mt-2 text-sm text-ink/70">查看单个学生的成绩轨迹和最近变化。</p>
            </div>
            <AdminLogoutButton redirectPath={`/admin/score-tracker/students/${params.studentId}`} />
          </div>
          <div className="mt-6">
            <ScoreTrackerAdminErrorBanner error="missing-table" />
          </div>
        </div>
      );
    }

    throw fetchError;
  }

  if (!summary) {
    notFound();
  }

  const saved = firstValue(searchParams?.saved);
  const deleted = firstValue(searchParams?.deleted);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">成绩追踪后台</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">{summary.student.name}</h1>
          <p className="mt-2 text-sm text-ink/70">
            高{summary.student.grade === '10' ? '一' : summary.student.grade === '11' ? '二' : '三'} · {summary.student.className}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/score-tracker" className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回列表
          </Link>
          <Link
            href={`/admin/score-tracker/students/${summary.student.id}/edit`}
            className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5"
          >
            编辑学生
          </Link>
          <Link
            href={`/admin/score-tracker/students/${summary.student.id}/exams/new`}
            className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90"
          >
            新增考试记录
          </Link>
          <AdminLogoutButton redirectPath={`/admin/score-tracker/students/${summary.student.id}`} />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <ScoreTrackerAdminErrorBanner error={error} />
        {saved === 'student' ? <p className="rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">学生信息已保存。</p> : null}
        {saved === 'exam' ? <p className="rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">考试记录已保存。</p> : null}
        {deleted === 'exam' ? <p className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-700">考试记录已删除。</p> : null}
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-5">
          <p className="text-sm text-ink/65">考试总次数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{summary.examCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-5">
          <p className="text-sm text-ink/65">最近一次总分</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatScore(summary.latestExam?.totalScore)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-5">
          <p className="text-sm text-ink/65">最近一次班排</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatRank(summary.latestExam?.classRank)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/85 p-5">
          <p className="text-sm text-ink/65">最近一次年排</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatRank(summary.latestExam?.gradeRank)}</p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-tide">最近结论</h2>
            <p className="mt-2 text-sm text-ink/70">固定对比最近两次考试，不附加策略，只输出事实变化。</p>
          </div>
        </div>
        {summary.examCount < 2 ? (
          <p className="mt-5 rounded-xl border border-dashed border-tide/20 p-4 text-sm text-ink/60">当前只有 1 次考试记录，先继续录入后续考试，再看变化结论。</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="text-sm text-ink/65">总分变化</p>
              <p className="mt-2 text-lg font-semibold text-tide">{formatScoreDelta(summary.latestChange.totalScoreDelta)}</p>
            </article>
            <article className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="text-sm text-ink/65">班排变化</p>
              <p className="mt-2 text-lg font-semibold text-tide">{formatRankDelta(summary.latestChange.classRankDelta)}</p>
            </article>
            <article className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="text-sm text-ink/65">年排变化</p>
              <p className="mt-2 text-lg font-semibold text-tide">{formatRankDelta(summary.latestChange.gradeRankDelta)}</p>
            </article>
            <article className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="text-sm text-ink/65">进步最大科目</p>
              <p className="mt-2 text-lg font-semibold text-tide">{describeSubjectDelta(summary.latestChange.bestImprovedSubject, '暂无可比较科目')}</p>
            </article>
            <article className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="text-sm text-ink/65">下滑最大科目</p>
              <p className="mt-2 text-lg font-semibold text-tide">{describeSubjectDelta(summary.latestChange.worstDroppedSubject, '暂无可比较科目')}</p>
            </article>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <h2 className="text-2xl font-semibold text-tide">成绩趋势</h2>
        <p className="mt-2 text-sm text-ink/70">可切换查看分数、排名和得分率；得分率按“总分 / 总分满分”计算，排名里同时展示班排和年排。</p>
        <div className="mt-5">
          <TrendChart points={summary.trendPoints} />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-tide">成绩时间线台账</h2>
            <p className="mt-2 text-sm text-ink/70">按时间倒序展示每次考试成绩和录入的单科摘要。</p>
          </div>
          <Link
            href={`/admin/score-tracker/students/${summary.student.id}/exams/new`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
          >
            新增考试记录
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-tide/10 text-ink/70">
                <th className="px-3 py-2 font-medium">日期</th>
                <th className="px-3 py-2 font-medium">考试名称</th>
                <th className="px-3 py-2 font-medium">考试类型</th>
                <th className="px-3 py-2 font-medium">总分</th>
                <th className="px-3 py-2 font-medium">班排</th>
                <th className="px-3 py-2 font-medium">年排</th>
                <th className="px-3 py-2 font-medium">各科成绩摘要</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {summary.records.length > 0 ? (
                summary.records.map((record) => (
                  <tr key={record.id} className="border-b border-tide/10 align-top">
                    <td className="px-3 py-3 text-ink/80">{record.examDate}</td>
                    <td className="px-3 py-3 font-medium text-tide">{record.examName}</td>
                    <td className="px-3 py-3 text-ink/80">{EXAM_TYPE_LABELS[record.examType]}</td>
                    <td className="px-3 py-3 text-ink/80">{formatScore(record.totalScore)}</td>
                    <td className="px-3 py-3 text-ink/80">{formatRank(record.classRank)}</td>
                    <td className="px-3 py-3 text-ink/80">{formatRank(record.gradeRank)}</td>
                    <td className="px-3 py-3 text-ink/80">{summarizeSubjectScores(record.subjectScores)}</td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/score-tracker/students/${summary.student.id}/exams/${record.id}/edit`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-ink/60">
                    还没有考试记录，先新增一条。
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
