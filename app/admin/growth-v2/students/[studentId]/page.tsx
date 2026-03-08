import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { MasteryBadge } from '@/components/growth-v2/ui/mastery-badge';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StarRating } from '@/components/growth-v2/ui/star-rating';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import { StudentAvatar } from '@/components/growth-v2/ui/student-avatar';
import { firstValue, fmt, fmtPct, fmtRank } from '@/lib/growth-v2-format';
import { getGrowthStudentReportById, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

import { StudentDetailCharts } from './student-detail-charts';

type PageProps = {
  params: { studentId: string };
  searchParams?: { error?: string | string[]; saved?: string | string[] };
};

const examTypeLabels: Record<string, string> = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
};

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({ params, searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const saved = firstValue(searchParams?.saved) === 'student';
  const detailHref = `/admin/growth-v2/students/${params.studentId}`;

  const gate = renderGrowthV2AdminGate({ successPath: detailHref, searchError: error });
  if (gate) return gate;

  let report;
  try {
    report = await getGrowthStudentReportById(params.studentId);
  } catch (e) {
    if (isGrowthV2TableMissingError(e)) {
      return (
        <div>
          <GrowthV2AdminErrorBanner error="missing-table" />
        </div>
      );
    }
    throw e;
  }

  if (!report) notFound();

  // Compute stats not in the report type
  const lessons = report.recentLessons;
  const entryScores = lessons.map((l) => l.entryScore).filter((v): v is number => v !== null);
  const avgEntryScore = entryScores.length > 0 ? entryScores.reduce((a, b) => a + b, 0) / entryScores.length : null;

  // Progress trend: compare avg exit rate of last 3 vs previous 3
  const exitRates = lessons
    .slice()
    .reverse()
    .map((l) => l.exitScoreRate)
    .filter((v): v is number => v !== null);
  let progressTrend: number | null = null;
  if (exitRates.length >= 4) {
    const recent = exitRates.slice(-3);
    const earlier = exitRates.slice(-6, -3);
    if (earlier.length > 0) {
      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgEarlier = earlier.reduce((a, b) => a + b, 0) / earlier.length;
      progressTrend = avgRecent - avgEarlier;
    }
  }

  // Chart data (chronological order)
  const chartLessons = lessons.slice().reverse();
  const chartLabels = chartLessons.map((l) => l.lesson.lessonDate.slice(5));
  const chartEntryScores = chartLessons.map((l) => l.entryScore);
  const chartExitRates = chartLessons.map((l) => l.exitScoreRate);
  const chartTooltipLabels = chartLessons.map((l) => `${l.lesson.lessonDate} ${l.lesson.topic}`);

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />
      {saved ? (
        <p className="mb-4 rounded-lg border border-[#00b894]/30 bg-[#d4f2ea] px-3 py-2 text-sm text-[#00b894]">
          学生档案已更新。
        </p>
      ) : null}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={'/admin/growth-v2/students' as Route}
          className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-text-light transition hover:bg-surface-alt"
        >
          ← 返回
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <StudentAvatar name={report.student.name} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {report.student.name} <span className="font-normal text-text-light">的学习档案</span>
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {report.student.gradeLabel || '--'} · {report.homeGroup?.name ?? '--'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="累计课次"
          value={String(report.lessonCount)}
          sub="已上课程"
          colorClass="bg-stat-blue-soft"
          valueColorClass="text-stat-blue"
        />
        <StatCard
          label="进门考均分"
          value={avgEntryScore !== null ? fmt(avgEntryScore) : '--'}
          sub="满分10分"
          colorClass="bg-stat-amber-soft"
          valueColorClass="text-stat-amber"
        />
        <StatCard
          label="课后测试得分率"
          value={fmtPct(report.avgExitScoreRate)}
          sub="平均得分率"
          colorClass="bg-stat-emerald-soft"
          valueColorClass="text-stat-emerald"
        />
        <StatCard
          label="进步趋势"
          value={progressTrend !== null ? `${progressTrend >= 0 ? '+' : ''}${progressTrend.toFixed(1)}%` : '--'}
          sub="前后期得分率对比"
          colorClass="bg-stat-rose-soft"
          valueColorClass={progressTrend !== null && progressTrend >= 0 ? 'text-stat-emerald' : 'text-[#e05555]'}
        />
      </div>

      {/* Score Trend Chart */}
      {chartLessons.length > 1 ? (
        <section className="mt-10">
          <SectionTitle title="进门考与课后测试趋势" />
          <div className="mt-4 rounded-2xl border border-border-light bg-surface p-4 shadow-sm">
            <StudentDetailCharts
              labels={chartLabels}
              entryScores={chartEntryScores}
              exitRates={chartExitRates}
              tooltipLabels={chartTooltipLabels}
            />
          </div>
        </section>
      ) : null}

      {/* Exam Results */}
      {report.recentExams.length > 0 ? (
        <section className="mt-10">
          <SectionTitle title="考试成绩" />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                  <th className="px-4 py-3">日期</th>
                  <th className="px-4 py-3">考试</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">成绩</th>
                  <th className="px-4 py-3">排名</th>
                  <th className="px-4 py-3">掌握度</th>
                  <th className="px-4 py-3">薄弱点</th>
                </tr>
              </thead>
              <tbody>
                {report.recentExams.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border-light last:border-b-0 ${i % 2 === 0 ? '' : 'bg-tide/[0.03]'}`}
                  >
                    <td className="px-4 py-3.5 text-text-light">{item.exam.examDate}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink">{item.exam.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                          item.exam.examType === 'school'
                            ? 'bg-tide/10 text-tide'
                            : 'bg-stat-rose-soft text-stat-rose'
                        }`}
                      >
                        {examTypeLabels[item.exam.examType] ?? item.exam.examType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-ink">{fmt(item.score, 0)}</span>
                      <span className="ml-1 text-xs text-text-muted">({fmtPct(item.scoreRate)})</span>
                    </td>
                    <td className="px-4 py-3.5 text-text-light">{fmtRank(item.classRank, item.gradeRank)}</td>
                    <td className="px-4 py-3.5">
                      <MasteryBadge value={item.masteryLevel} />
                    </td>
                    <td className="px-4 py-3.5">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent"
                            >
                              {tag.tagName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-text-muted">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Top Weak Tags */}
      {report.topWeakTags.length > 0 ? (
        <section className="mt-10">
          <SectionTitle title="高频薄弱点" color="bg-accent" />
          <div className="mt-4 flex flex-wrap gap-2">
            {report.topWeakTags.map((tag) => (
              <span
                key={tag.tagName}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
              >
                {tag.tagName} · {tag.count}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Lesson Records */}
      <section className="mt-10">
        <SectionTitle title="课堂记录" />
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                <th className="px-4 py-3">日期</th>
                <th className="px-4 py-3">课堂主题</th>
                <th className="px-4 py-3">进门考</th>
                <th className="px-4 py-3">课后得分率</th>
                <th className="px-4 py-3">课堂表现</th>
                <th className="px-4 py-3">掌握度</th>
                <th className="px-4 py-3">教师评语</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? (
                lessons.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b border-border-light last:border-b-0 ${i % 2 === 0 ? '' : 'bg-tide/[0.03]'}`}
                  >
                    <td className="px-4 py-3.5 text-text-light">{item.lesson.lessonDate}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink">{item.lesson.topic}</p>
                      {item.lesson.homework ? (
                        <p className="mt-0.5 text-xs text-text-muted">作业：{item.lesson.homework}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.entryScore !== null ? (
                        <span className="inline-block rounded-full bg-tide/10 px-2 py-0.5 text-xs font-semibold text-tide">
                          {fmt(item.entryScore)}
                        </span>
                      ) : (
                        <span className="text-text-muted">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {item.exitScoreRate !== null ? (
                        <span className="inline-block rounded-full bg-stat-emerald-soft px-2 py-0.5 text-xs font-semibold text-stat-emerald">
                          {fmtPct(item.exitScoreRate)}
                        </span>
                      ) : (
                        <span className="text-text-muted">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StarRating value={item.performance} />
                    </td>
                    <td className="px-4 py-3.5">
                      <MasteryBadge value={item.masteryLevel} />
                    </td>
                    <td className="max-w-[200px] px-4 py-3.5 text-text-light">{item.comment || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-text-muted">
                    当前还没有课堂记录。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="mt-10 flex flex-wrap gap-3 border-t border-border-light pt-6">
        <Link
          href={`/admin/growth-v2/students/${report.student.id}/edit` as Route}
          className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5"
        >
          编辑学生
        </Link>
        <Link
          href={`/growth-v2/parent/${report.student.parentAccessToken}` as Route}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5"
        >
          打开家长页
        </Link>
      </div>
    </div>
  );
}
