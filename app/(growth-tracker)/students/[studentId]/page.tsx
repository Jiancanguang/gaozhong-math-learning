import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentById } from '@/lib/score-tracker';
import { GRADE_LABELS, listStudentLessonRecords } from '@/lib/growth-tracker';
import { getMasteryMeta, formatPerformanceStars, formatEntryExitDelta, formatScoreOutOf10 } from '@/lib/growth-tracker-display';

export const metadata: Metadata = {
  title: '学生详情 — 筑学工作室'
};

type Props = {
  params: { studentId: string };
  searchParams: { saved?: string };
};

export default async function StudentDetailPage({ params, searchParams }: Props) {
  const student = await getStudentById(params.studentId);
  if (!student) notFound();

  const lessonRecords = await listStudentLessonRecords(params.studentId);

  // --- Computed stats ---
  const entryScores = lessonRecords.filter((r) => r.entryScore != null).map((r) => r.entryScore!);
  const exitScores = lessonRecords.filter((r) => r.exitScore != null).map((r) => r.exitScore!);
  const avgEntry = entryScores.length > 0 ? (entryScores.reduce((a, b) => a + b, 0) / entryScores.length).toFixed(1) : '--';
  const avgExit = exitScores.length > 0 ? (exitScores.reduce((a, b) => a + b, 0) / exitScores.length).toFixed(1) : '--';

  // Average per-lesson gain
  const recordsWithScores = lessonRecords.filter((r) => r.entryScore != null && r.exitScore != null);
  const avgGain =
    recordsWithScores.length > 0
      ? recordsWithScores.reduce((s, r) => s + (r.exitScore! - r.entryScore!), 0) / recordsWithScores.length
      : null;

  // Progress trend: compare first half vs second half exit scores
  const midpoint = Math.floor(recordsWithScores.length / 2);
  const firstHalf = recordsWithScores.slice(0, midpoint);
  const secondHalf = recordsWithScores.slice(midpoint);
  const avgFirstExit = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.exitScore!, 0) / firstHalf.length : null;
  const avgSecondExit = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.exitScore!, 0) / secondHalf.length : null;
  const progressDelta = avgFirstExit != null && avgSecondExit != null ? avgSecondExit - avgFirstExit : null;

  // Mastery distribution
  const masteryDist = { mastered: 0, partial: 0, weak: 0 };
  for (const r of lessonRecords) {
    if (r.mastery === 'mastered') masteryDist.mastered++;
    else if (r.mastery === 'partial') masteryDist.partial++;
    else if (r.mastery === 'weak') masteryDist.weak++;
  }
  const totalWithMastery = masteryDist.mastered + masteryDist.partial + masteryDist.weak;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href={'/students' as never} className="text-sm text-ink/50 hover:text-gt-primary">
          ← 学生列表
        </Link>
      </div>

      {searchParams.saved === 'student' ? (
        <p className="mt-3 rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">保存成功。</p>
      ) : null}

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gt-primary">{student.name}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {GRADE_LABELS[student.grade] ?? student.grade}
            {student.groupName ? ` · ${student.groupName}` : ''}
            <span
              className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                student.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {student.status === 'active' ? '在读' : '已结课'}
            </span>
          </p>
        </div>
        <Link
          href={`/students/${student.id}/edit` as never}
          className="rounded-lg border border-gt-primary/20 px-4 py-2 text-sm text-ink/60 transition hover:text-gt-primary"
        >
          编辑资料
        </Link>
      </div>

      {/* Quick stats - 4 cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="课堂记录" value={`${lessonRecords.length} 次`} />
        <StatCard label="进门考均分" value={avgEntry} />
        <StatCard label="出门考均分" value={avgExit} />
        <StatCard
          label="每课平均提升"
          value={avgGain != null ? `${avgGain > 0 ? '+' : ''}${avgGain.toFixed(1)}` : '--'}
          highlight={avgGain != null ? (avgGain > 0 ? 'green' : avgGain < 0 ? 'red' : undefined) : undefined}
        />
      </div>

      {/* Overall progress trend */}
      {progressDelta != null && recordsWithScores.length >= 4 ? (
        <div className="mt-4 rounded-xl border border-gt-primary/10 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-gt-primary">能力变化趋势</h2>
          <div className="mt-3 flex items-center gap-4">
            <div
              className={`text-2xl font-bold ${
                progressDelta > 0.2 ? 'text-gt-green' : progressDelta < -0.2 ? 'text-gt-red' : 'text-ink/50'
              }`}
            >
              {progressDelta > 0.2 ? '↑' : progressDelta < -0.2 ? '↓' : '→'} {Math.abs(progressDelta).toFixed(1)}
            </div>
            <p className="text-sm text-ink/60">
              {progressDelta > 0.2
                ? '出门考成绩呈上升趋势，近期表现优于前期'
                : progressDelta < -0.2
                  ? '出门考成绩有所下降，需关注近期学习状态'
                  : '成绩保持稳定'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Score trend chart */}
      {recordsWithScores.length >= 2 ? (
        <div className="mt-4 rounded-xl border border-gt-primary/10 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-gt-primary">成绩趋势</h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-ink/50">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky" /> 进门考
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gt-green" /> 出门考
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: '140px' }}>
            {recordsWithScores.map((record) => (
              <div key={record.id} className="flex flex-col items-center gap-0.5" style={{ minWidth: '32px', flex: '1 1 0' }}>
                <div className="flex items-end gap-px" style={{ height: '100px' }}>
                  <div
                    className="w-3 rounded-t-sm bg-sky"
                    style={{ height: `${(record.entryScore! / 10) * 100}%` }}
                    title={`进门考: ${record.entryScore}`}
                  />
                  <div
                    className="w-3 rounded-t-sm bg-gt-green"
                    style={{ height: `${(record.exitScore! / 10) * 100}%` }}
                    title={`出门考: ${record.exitScore}`}
                  />
                </div>
                <span className="mt-0.5 max-w-[32px] truncate text-[10px] text-ink/40">{record.lesson.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Mastery distribution */}
      {totalWithMastery > 0 ? (
        <div className="mt-4 rounded-xl border border-gt-primary/10 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-gt-primary">掌握程度分布</h2>
          <div className="mt-3 flex h-5 w-full overflow-hidden rounded-full">
            {masteryDist.mastered > 0 ? (
              <div className="bg-emerald-500" style={{ width: `${(masteryDist.mastered / totalWithMastery) * 100}%` }} />
            ) : null}
            {masteryDist.partial > 0 ? (
              <div className="bg-amber-400" style={{ width: `${(masteryDist.partial / totalWithMastery) * 100}%` }} />
            ) : null}
            {masteryDist.weak > 0 ? (
              <div className="bg-rose-400" style={{ width: `${(masteryDist.weak / totalWithMastery) * 100}%` }} />
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              已掌握 {masteryDist.mastered}次
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
              部分掌握 {masteryDist.partial}次
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
              薄弱 {masteryDist.weak}次
            </span>
          </div>
        </div>
      ) : null}

      {/* Lesson records */}
      <h2 className="mt-8 text-lg font-semibold text-gt-primary">课堂记录</h2>
      {lessonRecords.length === 0 ? (
        <p className="mt-3 rounded-xl border border-gt-primary/10 bg-white/80 p-6 text-center text-sm text-ink/50">暂无课堂记录</p>
      ) : (
        <div className="mt-3 space-y-3">
          {[...lessonRecords].reverse().map((record) => {
            const masteryMeta = getMasteryMeta(record.mastery);
            return (
              <div key={record.id} className="rounded-xl border border-gt-primary/10 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gt-primary">{record.lesson.topic || '未命名课程'}</span>
                    <span className="ml-3 text-xs text-ink/50">{record.lesson.date}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${masteryMeta.className}`}>{masteryMeta.label}</span>
                </div>
                {/* Score bars */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-xs text-ink/50">进门考</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-sky" style={{ width: `${((record.entryScore ?? 0) / 10) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-ink/70">{formatScoreOutOf10(record.entryScore)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-xs text-ink/50">出门考</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-gt-green" style={{ width: `${((record.exitScore ?? 0) / 10) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-ink/70">{formatScoreOutOf10(record.exitScore)}</span>
                  </div>
                </div>
                {/* Delta badge + performance */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  {record.entryScore != null && record.exitScore != null ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        record.exitScore - record.entryScore > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : record.exitScore - record.entryScore < 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {formatEntryExitDelta(record.entryScore, record.exitScore)}
                    </span>
                  ) : null}
                  <span className="text-xs text-ink/60">课堂表现: {formatPerformanceStars(record.performance)}</span>
                </div>
                {record.comment ? <p className="mt-2 text-sm text-ink/60">评语：{record.comment}</p> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' }) {
  return (
    <div className="rounded-xl border border-gt-primary/10 bg-white/80 p-4 text-center">
      <p className="text-xs text-ink/50">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          highlight === 'green' ? 'text-gt-green' : highlight === 'red' ? 'text-gt-red' : 'text-gt-primary'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
