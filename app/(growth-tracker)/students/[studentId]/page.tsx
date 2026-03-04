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

  const entryScores = lessonRecords.filter((r) => r.entryScore != null).map((r) => r.entryScore!);
  const exitScores = lessonRecords.filter((r) => r.exitScore != null).map((r) => r.exitScore!);
  const avgEntry = entryScores.length > 0 ? (entryScores.reduce((a, b) => a + b, 0) / entryScores.length).toFixed(1) : '--';
  const avgExit = exitScores.length > 0 ? (exitScores.reduce((a, b) => a + b, 0) / exitScores.length).toFixed(1) : '--';

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

      {/* Quick stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="课堂记录" value={`${lessonRecords.length} 次`} />
        <StatCard label="进门考均分" value={avgEntry} />
        <StatCard label="出门考均分" value={avgExit} />
      </div>

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
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${masteryMeta.className}`}>
                    {masteryMeta.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/70">
                  <span>进门考: {formatScoreOutOf10(record.entryScore)}</span>
                  <span>出门考: {formatScoreOutOf10(record.exitScore)}</span>
                  <span>变化: {formatEntryExitDelta(record.entryScore, record.exitScore)}</span>
                  <span>课堂表现: {formatPerformanceStars(record.performance)}</span>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gt-primary/10 bg-white/80 p-4 text-center">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gt-primary">{value}</p>
    </div>
  );
}
