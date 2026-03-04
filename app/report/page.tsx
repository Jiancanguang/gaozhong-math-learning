import type { Metadata } from 'next';
import { getStudentByParentToken, listStudentLessonRecords, GRADE_LABELS } from '@/lib/growth-tracker';
import { ScoreTrendChart } from '@/components/growth-tracker/score-trend-chart';
import { RadarChart } from '@/components/growth-tracker/radar-chart';
import { MasteryGrid } from '@/components/growth-tracker/mastery-grid';
import { CommentTimeline } from '@/components/growth-tracker/comment-timeline';

export const metadata: Metadata = {
  title: '成长报告 — 筑学工作室'
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: { token?: string };
};

export default async function ParentReportPage({ searchParams }: Props) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gt-primary">无效链接</h1>
        <p className="mt-3 text-sm text-ink/60">缺少访问令牌，请使用老师发送的完整链接访问。</p>
      </div>
    );
  }

  const student = await getStudentByParentToken(token);

  if (!student) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gt-primary">未找到学生</h1>
        <p className="mt-3 text-sm text-ink/60">链接已失效或学生已结课。如有疑问请联系老师。</p>
      </div>
    );
  }

  const lessonRecords = await listStudentLessonRecords(student.id);

  // Calculate radar chart dimensions from recent 5 records
  const recent = lessonRecords.slice(-5);
  const radar = calculateRadarData(recent);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
      {/* Header */}
      <div className="rounded-2xl border border-gt-primary/10 bg-white/90 p-6 text-center shadow-card">
        <p className="text-sm font-medium text-gt-accent">筑学工作室 · 学生成长报告</p>
        <h1 className="mt-2 text-3xl font-semibold text-gt-primary" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {student.name}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          {GRADE_LABELS[student.grade] ?? student.grade}
          {student.groupName ? ` · ${student.groupName}` : ''}
          {` · 共 ${lessonRecords.length} 次课堂记录`}
        </p>
      </div>

      {lessonRecords.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gt-primary/10 bg-white/90 p-8 text-center">
          <p className="text-ink/50">暂无课堂数据，请等待老师录入后再查看。</p>
        </div>
      ) : (
        <>
          {/* Module 1: Score trend */}
          <section className="mt-8 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gt-primary">进出门考成绩趋势</h2>
            <div className="mt-4">
              <ScoreTrendChart records={lessonRecords} />
            </div>
          </section>

          {/* Module 2: Radar chart */}
          <section className="mt-6 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gt-primary">能力雷达图</h2>
            <p className="mt-1 text-xs text-ink/50">基于最近 {recent.length} 次课堂数据自动计算</p>
            <div className="mt-4">
              <RadarChart
                computeAbility={radar.computeAbility}
                logicThinking={radar.logicThinking}
                analysisSkill={radar.analysisSkill}
                knowledge={radar.knowledge}
              />
            </div>
          </section>

          {/* Module 3: Mastery grid */}
          <section className="mt-6 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gt-primary">知识点掌握情况</h2>
            <div className="mt-4">
              <MasteryGrid records={lessonRecords} />
            </div>
          </section>

          {/* Module 4: Comment timeline */}
          <section className="mt-6 rounded-2xl border border-gt-primary/10 bg-white/90 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-gt-primary">教师评语</h2>
            <div className="mt-4">
              <CommentTimeline records={lessonRecords} />
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-ink/40">筑学工作室 · 高中数学小组课辅导</p>
    </div>
  );
}

function calculateRadarData(records: Array<{ entryScore: number | null; exitScore: number | null; performance: number | null; mastery: string | null }>) {
  if (records.length === 0) {
    return { computeAbility: 0, logicThinking: 0, analysisSkill: 0, knowledge: 0 };
  }

  // Compute ability: (entry + exit) average rate × 5
  const entryExitScores = records.filter((r) => r.entryScore != null && r.exitScore != null);
  const avgScoreRate = entryExitScores.length > 0
    ? entryExitScores.reduce((sum, r) => sum + ((r.entryScore! + r.exitScore!) / 20), 0) / entryExitScores.length
    : 0;
  const computeAbility = Math.round(avgScoreRate * 5 * 10) / 10;

  // Logic thinking: performance average (already 1-5)
  const perfs = records.filter((r) => r.performance != null).map((r) => r.performance!);
  const logicThinking = perfs.length > 0 ? Math.round((perfs.reduce((a, b) => a + b, 0) / perfs.length) * 10) / 10 : 0;

  // Analysis skill: mastery converted (mastered=5, partial=3, weak=1)
  const masteryValues = records.filter((r) => r.mastery != null).map((r) => {
    if (r.mastery === 'mastered') return 5;
    if (r.mastery === 'partial') return 3;
    return 1;
  });
  const analysisSkill = masteryValues.length > 0
    ? Math.round((masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length) * 10) / 10
    : 0;

  // Knowledge: exit score average / 10 × 5
  const exitScores = records.filter((r) => r.exitScore != null).map((r) => r.exitScore!);
  const knowledge = exitScores.length > 0
    ? Math.round(((exitScores.reduce((a, b) => a + b, 0) / exitScores.length) / 10) * 5 * 10) / 10
    : 0;

  return { computeAbility, logicThinking, analysisSkill, knowledge };
}
