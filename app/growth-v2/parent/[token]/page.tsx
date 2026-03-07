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

const masteryColorMap: Record<string, string> = {
  lv985: 'bg-[#f7ead5] text-[#f0932b] border-[#f0932b]',
  lvtk: 'bg-[#f0e6f8] text-[#6b21a8] border-[#6b21a8]',
  lveb: 'bg-[#e3edf8] text-[#2b5797] border-[#2b5797]',
  lvbk: 'bg-[#e0f5e9] text-[#16a34a] border-[#16a34a]',
  lvzk: 'bg-[#f7dede] text-[#e05555] border-[#e05555]'
};

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

function MasteryBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-[#9f96ab]">--</span>;
  const colorClass = masteryColorMap[value] ?? 'bg-[#f3f1f5] text-[#6b6478] border-[#ddd8e0]';
  return (
    <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
      {formatMastery(value)}
    </span>
  );
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2ParentPage({ params }: GrowthV2ParentPageProps) {
  const overviewHref = '/growth-v2' as Route;

  if (params.token === 'demo-token') {
    return (
      <div className="space-y-8">
        {/* Purple gradient header */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] p-10 text-center text-white shadow-card">
          <p className="text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
          <h1 className="mt-2 font-['Noto_Serif_SC',serif] text-3xl font-bold">家长成长报告页</h1>
          <p className="mt-2 text-sm opacity-65">正式访问时会根据每位学生的 token 拉取真实数据</p>
          <div className="mt-6">
            <Link href={overviewHref} className="rounded-full border-2 border-white/50 bg-white/15 px-6 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30">
              返回 Growth V2 概览
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {demoSections.map((item) => (
            <article key={item} className="rounded-2xl border border-[#ddd8e0] bg-[#f9f8fa] p-5 shadow-card">
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
        <h1 className="mt-2 font-['Noto_Serif_SC',serif] text-3xl font-bold">家长报告暂不可用</h1>
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
          <h1 className="mt-2 font-['Noto_Serif_SC',serif] text-3xl font-bold">家长报告暂不可用</h1>
          <p className="mt-3 text-sm opacity-75">Growth V2 数据表还没有建好，完成数据库初始化后这个链接会自动恢复。</p>
        </div>
      );
    }

    throw fetchError;
  }

  if (!report) {
    notFound();
  }

  const statCards = [
    { label: '课堂记录', value: String(report.lessonCount), color: 'bg-[#dfe9f7] text-[#4a90d9]' },
    { label: '平均课后得分率', value: formatPercent(report.avgExitScoreRate), color: 'bg-[#f7ead5] text-[#f0932b]' },
    { label: '平均课堂表现', value: formatNumber(report.avgPerformance), color: 'bg-[#d4f2ea] text-[#00b894]' },
    { label: '考试次数', value: String(report.examCount), color: 'bg-[#f7e3dd] text-[#e17055]' },
    { label: '平均考试得分率', value: formatPercent(report.avgExamScoreRate), color: 'bg-[#e4e0f8] text-[#6c5ce7]' }
  ];

  return (
    <div className="space-y-8">
      {/* Purple gradient header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a4bd6] via-[#6c5ce7] to-[#a29bfe] p-10 text-center text-white shadow-card">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08), transparent 60%)' }} />
        <p className="relative text-xs font-medium opacity-60">筑学工作室 · 学生成长报告</p>
        <h1 className="relative mt-2 font-['Noto_Serif_SC',serif] text-3xl font-bold">{report.student.name} 的成长追踪</h1>
        <p className="relative mt-2 text-sm opacity-65">
          年级：{report.student.gradeLabel || '--'} · 班组：{report.homeGroup?.name ?? '--'} · {report.student.status === 'active' ? '在读' : '归档'}
        </p>
        <div className="relative mt-5">
          <Link href={overviewHref} className="rounded-full border-2 border-white/50 bg-white/15 px-6 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30">
            ← 返回
          </Link>
        </div>
      </section>

      {/* Colored stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <article key={card.label} className={`rounded-2xl p-6 shadow-card ${card.color}`}>
            <p className="text-xs font-semibold opacity-70">{card.label}</p>
            <p className="mt-2 font-['Noto_Serif_SC',serif] text-3xl font-black leading-none">{card.value}</p>
          </article>
        ))}
      </section>

      {/* Weak points */}
      <section className="rounded-2xl border border-[#ddd8e0] bg-[#f9f8fa] p-6 shadow-card">
        <h2 className="flex items-center gap-2 font-['Noto_Serif_SC',serif] text-lg font-bold text-ink">
          <span className="h-5 w-1 rounded-sm bg-tide" />
          高频薄弱点
        </h2>
        {report.topWeakTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {report.topWeakTags.map((tag) => (
              <span key={tag.tagName} className="rounded-full bg-[#f7e3dd] px-3 py-1 text-xs font-semibold text-accent">
                {tag.tagName} · {tag.count}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#9f96ab]">当前还没有薄弱点标签记录。</p>
        )}
      </section>

      {/* Lesson timeline */}
      <section className="rounded-2xl border border-[#ddd8e0] bg-[#f9f8fa] p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 font-['Noto_Serif_SC',serif] text-lg font-bold text-ink">
            <span className="h-5 w-1 rounded-sm bg-tide" />
            课堂记录时间线
          </h2>
          <p className="text-sm text-[#9f96ab]">共 {report.recentLessons.length} 条</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-[#ddd8e0] bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#ddd8e0] bg-[#f3f1f5] text-center text-xs font-bold uppercase tracking-wider text-[#6b6478]">
                <th className="px-3 py-3 text-left">日期</th>
                <th className="px-3 py-3 text-left">课堂主题</th>
                <th className="px-3 py-3">班组</th>
                <th className="px-3 py-3">进门考</th>
                <th className="px-3 py-3">课后得分率</th>
                <th className="px-3 py-3">课堂表现</th>
                <th className="px-3 py-3">掌握度</th>
                <th className="px-3 py-3 text-left">教师评语</th>
              </tr>
            </thead>
            <tbody>
              {report.recentLessons.length > 0 ? (
                report.recentLessons.map((item, i) => (
                  <tr key={item.id} className={`border-b border-[#e8e3ea] align-top last:border-b-0 transition hover:bg-[rgba(108,92,231,0.04)] ${i % 2 === 1 ? 'bg-[rgba(108,92,231,0.03)]' : ''}`}>
                    <td className="px-3 py-3 font-['Noto_Serif_SC',serif] text-sm font-bold text-tide">{item.lesson.lessonDate}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{item.lesson.topic}</p>
                      {item.lesson.exitTestTopic ? <p className="mt-1 text-xs text-[#9f96ab]">课后测：{item.lesson.exitTestTopic}</p> : null}
                    </td>
                    <td className="px-3 py-3 text-center text-[#6b6478]">{item.group?.name ?? '--'}</td>
                    <td className="px-3 py-3 text-center font-bold text-tide">{formatNumber(item.entryScore)}</td>
                    <td className="px-3 py-3 text-center font-bold text-tide">{formatPercent(item.exitScoreRate)}</td>
                    <td className="px-3 py-3 text-center text-[#6b6478]">{formatNumber(item.performance)}</td>
                    <td className="px-3 py-3 text-center"><MasteryBadge value={item.masteryLevel} /></td>
                    <td className="px-3 py-3 text-[#6b6478]">{item.comment || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#9f96ab]">当前还没有课堂记录。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Exam timeline */}
      <section className="rounded-2xl border border-[#ddd8e0] bg-[#f9f8fa] p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="flex items-center gap-2 font-['Noto_Serif_SC',serif] text-lg font-bold text-ink">
            <span className="h-5 w-1 rounded-sm bg-tide" />
            考试成绩时间线
          </h2>
          <p className="text-sm text-[#9f96ab]">共 {report.recentExams.length} 条</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-[#ddd8e0] bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#ddd8e0] bg-[#f3f1f5] text-center text-xs font-bold uppercase tracking-wider text-[#6b6478]">
                <th className="px-3 py-3 text-left">日期</th>
                <th className="px-3 py-3 text-left">考试</th>
                <th className="px-3 py-3">类型</th>
                <th className="px-3 py-3">成绩</th>
                <th className="px-3 py-3">排名</th>
                <th className="px-3 py-3">掌握度</th>
                <th className="px-3 py-3 text-left">薄弱点</th>
                <th className="px-3 py-3 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              {report.recentExams.length > 0 ? (
                report.recentExams.map((item, i) => (
                  <tr key={item.id} className={`border-b border-[#e8e3ea] align-top last:border-b-0 transition hover:bg-[rgba(108,92,231,0.04)] ${i % 2 === 1 ? 'bg-[rgba(108,92,231,0.03)]' : ''}`}>
                    <td className="px-3 py-3 font-['Noto_Serif_SC',serif] text-sm font-bold text-tide">{item.exam.examDate}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink">{item.exam.name}</p>
                      <p className="mt-1 text-xs text-[#9f96ab]">{item.group?.name ?? '--'} · {item.exam.subject}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.exam.examType === 'school' ? 'bg-[#e4e0f8] text-tide' : 'bg-[#f7e3dd] text-accent'}`}>
                        {examTypeLabels[item.exam.examType]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <p className="font-bold text-tide">{formatNumber(item.score)}</p>
                      <p className="mt-1 text-xs text-[#9f96ab]">{formatPercent(item.scoreRate)}</p>
                    </td>
                    <td className="px-3 py-3 text-center text-[#6b6478]">{formatRank(item.classRank, item.gradeRank)}</td>
                    <td className="px-3 py-3 text-center"><MasteryBadge value={item.masteryLevel} /></td>
                    <td className="px-3 py-3">
                      {item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <span key={tag.id} className="rounded-full bg-[#f7e3dd] px-2 py-0.5 text-xs font-semibold text-accent">
                              {tag.tagName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#9f96ab]">--</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[#6b6478]">{item.note || item.exam.notes || '--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#9f96ab]">当前还没有考试记录。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
