import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GROWTH_V2_MASTERY_OPTIONS } from '@/lib/growth-v2';
import { getGrowthStudentReportById, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2StudentDetailPageProps = {
  params: {
    studentId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

const examTypeLabels = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
} as const;
const masteryLabelMap = new Map<string, string>(GROWTH_V2_MASTERY_OPTIONS.map((item) => [item.value, item.label]));

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNumber(value: number | null, digits = 1) {
  return value === null ? '--' : value.toFixed(digits);
}

function formatPercent(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)}%`;
}

function formatRank(classRank: number | null, gradeRank: number | null) {
  if (classRank === null && gradeRank === null) return '--';
  if (classRank !== null && gradeRank !== null) return `班 ${classRank} / 年 ${gradeRank}`;
  if (classRank !== null) return `班 ${classRank}`;
  return `年 ${gradeRank}`;
}

function formatMastery(value: string | null) {
  if (!value) return '--';
  return masteryLabelMap.get(value) ?? value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2StudentDetailPage({ params, searchParams }: GrowthV2StudentDetailPageProps) {
  const error = firstValue(searchParams?.error);
  const detailHref = `/admin/growth-v2/students/${params.studentId}`;
  const gate = renderGrowthV2AdminGate({
    successPath: detailHref,
    searchError: error
  });
  if (gate) return gate;

  let report = null;

  try {
    report = await getGrowthStudentReportById(params.studentId);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">学生详情</h1>
              <p className="mt-2 text-sm text-ink/70">学生详情页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/students' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回学生列表
              </Link>
              <AdminLogoutButton redirectPath={detailHref} />
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

  if (!report) {
    notFound();
  }

  const latestLesson = report.recentLessons[0] ?? null;
  const latestExam = report.recentExams[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">{report.student.name}</h1>
          <p className="mt-2 text-sm text-ink/70">
            {report.student.gradeLabel || '--'} · 常驻班组：{report.homeGroup?.name ?? '--'} · 状态：
            {report.student.status === 'active' ? '在读' : '归档'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/students' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回学生列表
          </Link>
          <Link
            href={`/growth-v2/parent/${report.student.parentAccessToken}` as Route}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5"
          >
            打开家长页
          </Link>
          <AdminLogoutButton redirectPath={detailHref} />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-5">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">课堂记录数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{report.lessonCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课后得分率</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatPercent(report.avgExitScoreRate)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课堂表现</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatNumber(report.avgPerformance)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">考试次数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{report.examCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均考试得分率</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatPercent(report.avgExamScoreRate)}</p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
          <h2 className="text-xl font-semibold text-tide">学生档案</h2>
          <div className="mt-4 space-y-3 text-sm text-ink/75">
            <p>家长 Token：<code className="rounded bg-paper px-2 py-1 text-xs text-tide">{report.student.parentAccessToken}</code></p>
            <p>常驻班组：{report.homeGroup?.name ?? '--'}</p>
            <p>创建时间：{report.student.createdAt.slice(0, 10)}</p>
            <p>最近更新时间：{report.student.updatedAt.slice(0, 10)}</p>
            <p>学生备注：{report.student.notes || '--'}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
          <h2 className="text-xl font-semibold text-tide">最近观察</h2>
          <div className="mt-4 grid gap-3 text-sm text-ink/80">
            <div className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="font-medium text-tide">最近课堂</p>
              <p className="mt-2">{latestLesson ? `${latestLesson.lesson.lessonDate} · ${latestLesson.lesson.topic}` : '暂无课堂记录'}</p>
              {latestLesson ? <p className="mt-1 text-ink/65">课后得分率：{formatPercent(latestLesson.exitScoreRate)} · 课堂表现：{formatNumber(latestLesson.performance)}</p> : null}
            </div>
            <div className="rounded-xl border border-tide/10 bg-paper/50 p-4">
              <p className="font-medium text-tide">最近考试</p>
              <p className="mt-2">{latestExam ? `${latestExam.exam.examDate} · ${latestExam.exam.name}` : '暂无考试记录'}</p>
              {latestExam ? <p className="mt-1 text-ink/65">得分率：{formatPercent(latestExam.scoreRate)} · 排名：{formatRank(latestExam.classRank, latestExam.gradeRank)}</p> : null}
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <h2 className="text-xl font-semibold text-tide">高频薄弱点</h2>
        {report.topWeakTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {report.topWeakTags.map((tag) => (
              <span key={tag.tagName} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                {tag.tagName} · {tag.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/65">当前还没有薄弱点标签记录。</p>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">课堂记录时间线</h2>
            <p className="mt-2 text-sm text-ink/70">按时间倒序展示该学生每节课的表现、掌握度和教师评语。</p>
          </div>
          <p className="text-sm text-ink/65">共 {report.recentLessons.length} 条记录</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">课堂主题</th>
                <th className="px-4 py-3 font-medium">班组</th>
                <th className="px-4 py-3 font-medium">身份</th>
                <th className="px-4 py-3 font-medium">进门考</th>
                <th className="px-4 py-3 font-medium">课后得分率</th>
                <th className="px-4 py-3 font-medium">课堂表现</th>
                <th className="px-4 py-3 font-medium">掌握度</th>
                <th className="px-4 py-3 font-medium">教师评语</th>
              </tr>
            </thead>
            <tbody>
              {report.recentLessons.length > 0 ? (
                report.recentLessons.map((item) => (
                  <tr key={item.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">{item.lesson.lessonDate}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{item.lesson.topic}</p>
                      {item.lesson.homework ? <p className="mt-1 text-xs text-ink/55">作业：{item.lesson.homework}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{item.group?.name ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{item.isGuest ? '调课' : '常驻'}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(item.entryScore)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatPercent(item.exitScoreRate)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(item.performance)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatMastery(item.masteryLevel)}</td>
                    <td className="px-4 py-4 text-ink/80">{item.comment || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink/60">
                    当前还没有课堂记录。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">考试成绩时间线</h2>
            <p className="mt-2 text-sm text-ink/70">按时间倒序展示该学生每次考试的分数、排名、掌握度和薄弱点。</p>
          </div>
          <p className="text-sm text-ink/65">共 {report.recentExams.length} 条记录</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">考试</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">成绩</th>
                <th className="px-4 py-3 font-medium">排名</th>
                <th className="px-4 py-3 font-medium">掌握度</th>
                <th className="px-4 py-3 font-medium">薄弱点</th>
                <th className="px-4 py-3 font-medium">备注</th>
              </tr>
            </thead>
            <tbody>
              {report.recentExams.length > 0 ? (
                report.recentExams.map((item) => (
                  <tr key={item.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">{item.exam.examDate}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{item.exam.name}</p>
                      <p className="mt-1 text-xs text-ink/55">{item.group?.name ?? '--'} · {item.exam.subject}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{examTypeLabels[item.exam.examType]}</td>
                    <td className="px-4 py-4 text-ink/80">
                      <p>{formatNumber(item.score)}</p>
                      <p className="mt-1 text-xs text-ink/55">得分率：{formatPercent(item.scoreRate)}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{formatRank(item.classRank, item.gradeRank)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatMastery(item.masteryLevel)}</td>
                    <td className="px-4 py-4">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span key={tag.id} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                              {tag.tagName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-ink/55">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{item.note || item.exam.notes || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/60">
                    当前还没有考试记录。
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
