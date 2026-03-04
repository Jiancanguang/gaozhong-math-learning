import type { Metadata } from 'next';
import { listLessons, getDistinctGroupNames } from '@/lib/growth-tracker';
import { deleteLessonAction } from '@/app/(growth-tracker)/history/actions';

export const metadata: Metadata = {
  title: '历史记录 — 筑学工作室'
};

type Props = {
  searchParams: { group?: string; deleted?: string };
};

export default async function HistoryPage({ searchParams }: Props) {
  const groupFilter = searchParams.group ?? '';
  const lessons = await listLessons(groupFilter ? { groupName: groupFilter } : undefined);
  const groupNames = await getDistinctGroupNames();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gt-primary">历史记录</h1>

      {searchParams.deleted === '1' ? (
        <p className="mt-3 rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">课程已删除。</p>
      ) : null}

      {/* Filter */}
      <form className="mt-4 flex items-end gap-3">
        <div>
          <label className="block text-xs text-ink/60">班组</label>
          <select
            name="group"
            defaultValue={groupFilter}
            className="mt-1 rounded-lg border border-gt-primary/20 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-gt-accent"
          >
            <option value="">全部班组</option>
            {groupNames.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gt-primary/10 px-3 py-1.5 text-sm font-medium text-gt-primary transition hover:bg-gt-primary/20"
        >
          筛选
        </button>
      </form>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <p className="mt-6 rounded-xl border border-gt-primary/10 bg-white/80 p-6 text-center text-sm text-ink/50">暂无课程记录</p>
      ) : (
        <div className="mt-6 space-y-3">
          {lessons.map((lesson) => {
            const deleteAction = deleteLessonAction.bind(null, lesson.id);
            return (
              <div key={lesson.id} className="rounded-xl border border-gt-primary/10 bg-white/80 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-medium text-gt-primary">{lesson.topic || '未命名课程'}</span>
                    <span className="ml-3 text-xs text-ink/50">{lesson.date}</span>
                    <span className="ml-2 rounded-full bg-gt-primary/5 px-2 py-0.5 text-xs text-gt-primary">{lesson.groupName}</span>
                  </div>
                  <form action={deleteAction}>
                    <button
                      type="submit"
                      className="rounded-lg border border-gt-red/20 px-3 py-1 text-xs text-gt-red/60 transition hover:bg-gt-red/5 hover:text-gt-red"
                    >
                      删除
                    </button>
                  </form>
                </div>
                {lesson.entryTestTopic || lesson.exitTestTopic ? (
                  <div className="mt-2 flex gap-4 text-xs text-ink/50">
                    {lesson.entryTestTopic ? <span>进门考: {lesson.entryTestTopic}</span> : null}
                    {lesson.exitTestTopic ? <span>出门考: {lesson.exitTestTopic}</span> : null}
                  </div>
                ) : null}
                {lesson.notes ? <p className="mt-1 text-xs text-ink/50">备注: {lesson.notes}</p> : null}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-ink/40">共 {lessons.length} 节课程</p>
    </div>
  );
}
