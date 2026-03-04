import type { StudentLessonRecord } from '@/lib/growth-tracker';
import { formatScoreOutOf10, formatPerformanceStars } from '@/lib/growth-tracker-display';

type Props = {
  records: StudentLessonRecord[];
};

export function CommentTimeline({ records }: Props) {
  const withComments = [...records].reverse().filter((r) => r.comment);

  if (withComments.length === 0) {
    return <p className="text-sm text-ink/50">暂无教师评语</p>;
  }

  return (
    <div className="space-y-4">
      {withComments.map((record) => (
        <div key={record.id} className="relative border-l-2 border-gt-primary/20 pl-4">
          <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-gt-primary" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gt-primary">{record.lesson.topic || '未命名'}</span>
            <span className="text-xs text-ink/40">{record.lesson.date}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink/50">
            <span>进门考 {formatScoreOutOf10(record.entryScore)}</span>
            <span>出门考 {formatScoreOutOf10(record.exitScore)}</span>
            <span>{formatPerformanceStars(record.performance)}</span>
          </div>
          <p className="mt-1.5 text-sm text-ink/70">{record.comment}</p>
        </div>
      ))}
    </div>
  );
}
