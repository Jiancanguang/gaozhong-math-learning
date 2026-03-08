import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MasteryBadge } from '@/components/growth-v2/ui/mastery-badge';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import { StudentAvatar } from '@/components/growth-v2/ui/student-avatar';
import { firstValue, fmt, fmtPct, fmtRank } from '@/lib/growth-v2-format';
import type { GrowthParentReport } from '@/lib/growth-v2-store';
import { getGrowthParentReportByToken, isGrowthV2StoreEnabled, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

import { ParentCharts } from './parent-charts';

type PageProps = { params: { token: string }; searchParams?: { from?: string | string[]; to?: string | string[] } };

const examTypeLabels: Record<string, string> = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
};

const demoSections = ['进门考与课后测试趋势', '能力成长摘要', '知识点掌握情况', '考试成绩与薄弱点分析', '教师时间线评语'];

export const dynamic = 'force-dynamic';

export default async function ParentPage({ params, searchParams }: PageProps) {
  const overviewHref = '/growth-v2' as Route;
  const fromDate = firstValue(searchParams?.from)?.trim() || '';
  const toDate = firstValue(searchParams?.to)?.trim() || '';

  if (params.token === 'demo-token') {
    return (
      <div className="space-y-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] p-10 text-center text-white shadow-card">
          <p className="text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">家长成长报告页</h1>
          <p className="mt-2 text-sm opacity-65">正式访问时会根据每位学生的 token 拉取真实数据</p>
          <div className="mt-6">
            <Link href={overviewHref} className="rounded-full border-2 border-white/50 bg-white/15 px-6 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30">
              返回 Growth V2 概览
            </Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoSections.map((item) => (
            <article key={item} className="rounded-2xl border border-border-default bg-surface p-5 shadow-card">
              <p className="text-sm font-medium text-tide">{item}</p>
            </article>
          ))}
        </section>
      </div>
    );
  }

  if (!isGrowthV2StoreEnabled()) {
    return (
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] p-10 text-center text-white shadow-card">
        <p className="text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">家长报告暂不可用</h1>
        <p className="mt-3 text-sm opacity-75">当前环境还没有连接 Supabase 管理接口，暂时无法读取学生成长数据。</p>
      </div>
    );
  }

  let report: GrowthParentReport | null = null;
  try {
    report = await getGrowthParentReportByToken(params.token);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] p-10 text-center text-white shadow-card">
          <p className="text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">家长报告暂不可用</h1>
          <p className="mt-3 text-sm opacity-75">Growth V2 数据表还没有建好，完成数据库初始化后这个链接会自动恢复。</p>
        </div>
      );
    }
    throw fetchError;
  }

  if (!report) notFound();

  // Apply date filters
  const hasDateFilter = fromDate || toDate;
  const lessons = report.recentLessons.filter((l) => {
    if (fromDate && l.lesson.lessonDate < fromDate) return false;
    if (toDate && l.lesson.lessonDate > toDate) return false;
    return true;
  });
  const filteredExams = report.recentExams.filter((e) => {
    if (fromDate && e.exam.examDate < fromDate) return false;
    if (toDate && e.exam.examDate > toDate) return false;
    return true;
  });

  // Compute additional stats
  const entryScores = lessons.map((l) => l.entryScore).filter((v): v is number => v !== null);
  const avgEntryScore = entryScores.length > 0 ? entryScores.reduce((a, b) => a + b, 0) / entryScores.length : null;

  const exitRates = lessons.slice().reverse().map((l) => l.exitScoreRate).filter((v): v is number => v !== null);
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

  // Recompute filtered stats
  const filteredExitRates = lessons.flatMap((l) => (l.exitScoreRate === null ? [] : [l.exitScoreRate]));
  const filteredAvgExitRate = filteredExitRates.length ? filteredExitRates.reduce((a, b) => a + b, 0) / filteredExitRates.length : null;

  // Chart data (chronological)
  const chartLessons = lessons.slice().reverse();
  const chartLabels = chartLessons.map((l) => l.lesson.lessonDate.slice(5));
  const chartEntryScores = chartLessons.map((l) => l.entryScore);
  const chartExitRates = chartLessons.map((l) => l.exitScoreRate);
  const chartTooltipLabels = chartLessons.map((l) => `${l.lesson.lessonDate} ${l.lesson.topic}`);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 pb-12 pt-8 sm:px-6">
      {/* Purple gradient header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] px-8 py-10 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08), transparent 60%)' }} />
        <p className="relative text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
        <div className="relative mt-4 flex items-center gap-4">
          <StudentAvatar name={report.student.name} size="lg" />
          <div>
            <h1 className="font-serif text-3xl font-bold">{report.student.name} <span className="font-normal opacity-80">的成长报告</span></h1>
            <p className="mt-1 text-sm opacity-65">
              {report.student.gradeLabel || '--'} · {report.homeGroup?.name ?? '--'}
            </p>
          </div>
        </div>
      </section>

      {/* Date Range Filter */}
      <form className="rounded-2xl border border-border-light bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-text-light">开始日期</label>
            <input type="date" name="from" defaultValue={fromDate} className="w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-text-light">结束日期</label>
            <input type="date" name="to" defaultValue={toDate} className="w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
          </div>
          <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">筛选</button>
          {hasDateFilter ? (
            <a href={`/growth-v2/parent/${params.token}`} className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-light transition hover:bg-surface-alt">清除</a>
          ) : null}
        </div>
        {hasDateFilter ? (
          <p className="mt-2 text-xs text-text-muted">
            当前筛选：{fromDate || '不限'} ~ {toDate || '不限'}，共 {lessons.length} 节课、{filteredExams.length} 场考试
          </p>
        ) : null}
      </form>

      {/* Stat Cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="累计课次" value={String(lessons.length)} sub={hasDateFilter ? '筛选范围内' : '已上课程'} colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="进门考均分" value={avgEntryScore !== null ? fmt(avgEntryScore) : '--'} sub="满分10分" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="课后测试得分率" value={fmtPct(filteredAvgExitRate)} sub="平均得分率" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="进步趋势" value={progressTrend !== null ? `${progressTrend >= 0 ? '+' : ''}${progressTrend.toFixed(1)}%` : '--'} sub="前后期得分率对比" colorClass="bg-stat-rose-soft" valueColorClass={progressTrend !== null && progressTrend >= 0 ? 'text-stat-emerald' : 'text-[#e05555]'} />
      </section>

      {/* Score Trend Chart */}
      {chartLessons.length > 1 ? (
        <section>
          <SectionTitle title="进门考与课后测试趋势" />
          <div className="mt-4 rounded-2xl border border-border-light bg-surface p-4 shadow-sm">
            <ParentCharts labels={chartLabels} entryScores={chartEntryScores} exitRates={chartExitRates} tooltipLabels={chartTooltipLabels} />
          </div>
        </section>
      ) : null}

      {/* Exam Results */}
      {filteredExams.length > 0 ? (
        <section>
          <SectionTitle title="考试成绩与分析" />
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
                {filteredExams.map((item, i) => (
                  <tr key={item.id} className={`border-b border-border-light last:border-b-0 ${i % 2 === 1 ? 'bg-tide/[0.03]' : ''}`}>
                    <td className="px-4 py-3.5 font-serif text-sm font-bold text-tide">{item.exam.examDate}</td>
                    <td className="px-4 py-3.5 font-medium text-ink">{item.exam.name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.exam.examType === 'school' ? 'bg-tide/10 text-tide' : 'bg-stat-rose-soft text-stat-rose'}`}>
                        {examTypeLabels[item.exam.examType] ?? item.exam.examType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-ink">{fmt(item.score, 0)}</span>
                      <span className="ml-1 text-xs text-text-muted">({fmtPct(item.scoreRate)})</span>
                    </td>
                    <td className="px-4 py-3.5 text-text-light">{fmtRank(item.classRank, item.gradeRank)}</td>
                    <td className="px-4 py-3.5"><MasteryBadge value={item.masteryLevel} /></td>
                    <td className="px-4 py-3.5">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span key={tag.id} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{tag.tagName}</span>
                          ))}
                        </div>
                      ) : <span className="text-text-muted">--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Weak Points & Teacher Comments Timeline */}
      <section>
        <SectionTitle title="薄弱点与教师评语" color="bg-accent" />
        {(() => {
          const tagCounts = new Map<string, number>();
          for (const e of filteredExams) {
            for (const t of e.tags) tagCounts.set(t.tagName, (tagCounts.get(t.tagName) ?? 0) + 1);
          }
          const weakTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
          return weakTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {weakTags.map(([tagName, count]) => (
                <span key={tagName} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {tagName} · {count}
                </span>
              ))}
            </div>
          ) : null;
        })()}

        {/* Timeline */}
        <div className="mt-6 border-l-[2.5px] border-border-default pl-5">
          {lessons.length > 0 ? (
            lessons.filter((l) => l.comment).map((item) => (
              <div key={item.id} className="relative pb-6">
                <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-[2.5px] border-surface bg-tide shadow-[0_0_0_3px_rgba(108,92,231,0.15)]" />
                <p className="text-xs font-bold tracking-wide text-text-muted">{item.lesson.lessonDate}</p>
                <p className="mt-1 text-sm font-bold text-ink">{item.lesson.topic}</p>
                {item.comment ? (
                  <div className="mt-2 rounded-lg border-l-[3px] border-tide/30 bg-surface-alt px-3 py-2 text-sm text-text-light">
                    {item.comment}
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.entryScore !== null ? (
                    <span className="rounded-full bg-tide/10 px-2 py-0.5 text-xs font-semibold text-tide">
                      进门考 {fmt(item.entryScore)}
                    </span>
                  ) : null}
                  {item.exitScoreRate !== null ? (
                    <span className="rounded-full bg-stat-emerald-soft px-2 py-0.5 text-xs font-semibold text-stat-emerald">
                      课后 {fmtPct(item.exitScoreRate)}
                    </span>
                  ) : null}
                  <MasteryBadge value={item.masteryLevel} />
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-text-muted">当前还没有课堂记录。</p>
          )}
        </div>
      </section>
    </div>
  );
}
