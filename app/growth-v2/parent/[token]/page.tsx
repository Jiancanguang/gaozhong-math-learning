import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GROWTH_V2_MASTERY_OPTIONS } from '@/lib/growth-v2';
import type { GrowthParentReport } from '@/lib/growth-v2-store';
import { getGrowthParentReportByToken, isGrowthV2StoreEnabled, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2ParentPageProps = {
  params: {
    token: string;
  };
};

const demoSections = ['进门考与课后测试趋势', '能力成长摘要', '知识点掌握情况', '考试成绩与薄弱点分析', '教师时间线评语'];
const examTypeLabels = {
  school: '学校考试',
  internal: '工作室测验',
  other: '其他'
} as const;
const masteryLabelMap = new Map<string, string>(GROWTH_V2_MASTERY_OPTIONS.map((item) => [item.value, item.label]));

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

export default async function GrowthV2ParentPage({ params }: GrowthV2ParentPageProps) {
  const overviewHref = '/growth-v2' as Route;

  if (params.token === 'demo-token') {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl border border-tide/10 bg-white/85 p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Parent Report Preview</p>
          <h1 className="mt-3 text-3xl font-semibold text-tide">家长成长报告页</h1>
          <p className="mt-3 max-w-3xl text-sm text-ink/75">
            正式访问时会根据每位学生的 `parent_access_token` 拉取真实课堂记录、考试成绩和薄弱点标签。这个入口保留为公开预览，不暴露真实学生链接。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={overviewHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
              返回 Growth V2 概览
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoSections.map((item) => (
            <article key={item} className="rounded-2xl border border-tide/10 bg-white/85 p-5 shadow-card">
              <p className="text-sm font-medium text-tide">{item}</p>
            </article>
          ))}
        </section>
      </div>
    );
  }

  if (!isGrowthV2StoreEnabled()) {
    return (
      <div className="rounded-3xl border border-tide/10 bg-white/85 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Growth V2</p>
        <h1 className="mt-3 text-3xl font-semibold text-tide">家长报告暂不可用</h1>
        <p className="mt-3 text-sm text-ink/75">当前环境还没有连接 Supabase 管理接口，暂时无法读取学生成长数据。</p>
      </div>
    );
  }

  let report: GrowthParentReport | null = null;

  try {
    report = await getGrowthParentReportByToken(params.token);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="rounded-3xl border border-tide/10 bg-white/85 p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Growth V2</p>
          <h1 className="mt-3 text-3xl font-semibold text-tide">家长报告暂不可用</h1>
          <p className="mt-3 text-sm text-ink/75">Growth V2 数据表还没有建好，完成数据库初始化后这个链接会自动恢复。</p>
        </div>
      );
    }

    throw fetchError;
  }

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-tide/10 bg-white/90 p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Growth Parent Report</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-tide">{report.student.name} 的成长追踪</h1>
            <p className="mt-3 text-sm text-ink/75">
              年级：{report.student.gradeLabel || '--'} · 常驻班组：{report.homeGroup?.name ?? '--'} · 当前状态：
              {report.student.status === 'active' ? '在读' : '归档'}
            </p>
            {report.student.notes ? <p className="mt-2 text-sm text-ink/65">备注：{report.student.notes}</p> : null}
          </div>
          <Link href={overviewHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回概览
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

      <section className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
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

      <section className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">课堂记录时间线</h2>
            <p className="mt-2 text-sm text-ink/70">展示每节课的进门考、课后测、课堂表现和教师评语。</p>
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
                      {item.lesson.exitTestTopic ? <p className="mt-1 text-xs text-ink/55">课后测：{item.lesson.exitTestTopic}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{item.group?.name ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(item.entryScore)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatPercent(item.exitScoreRate)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(item.performance)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatMastery(item.masteryLevel)}</td>
                    <td className="px-4 py-4 text-ink/80">{item.comment || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/60">
                    当前还没有课堂记录。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">考试成绩时间线</h2>
            <p className="mt-2 text-sm text-ink/70">展示每次考试的成绩、排名、掌握度和高频薄弱点。</p>
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
                      <p className="mt-1 text-xs text-ink/55">
                        {item.group?.name ?? '--'} · {item.exam.subject}
                      </p>
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
