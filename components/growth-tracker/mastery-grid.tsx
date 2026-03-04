import type { StudentLessonRecord } from '@/lib/growth-tracker';
import { getMasteryMeta } from '@/lib/growth-tracker-display';

type Props = {
  records: StudentLessonRecord[];
};

export function MasteryGrid({ records }: Props) {
  if (records.length === 0) {
    return <p className="text-sm text-ink/50">暂无数据</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {[...records].reverse().map((record) => {
        const meta = getMasteryMeta(record.mastery);
        return (
          <div key={record.id} className="rounded-xl border border-gt-primary/10 bg-white p-3 text-center">
            <p className="truncate text-xs font-medium text-gt-primary">{record.lesson.topic || '未命名'}</p>
            <p className="mt-0.5 text-[10px] text-ink/40">{record.lesson.date}</p>
            <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
