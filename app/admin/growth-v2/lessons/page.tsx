import type { Route } from 'next';
import Link from 'next/link';

import { createGrowthLessonAction } from '@/app/admin/growth-v2/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2LessonBatchForm, type GrowthV2LessonFormGroup, type GrowthV2LessonFormStudent } from '@/components/growth-v2/lesson-batch-form';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthGroup, GrowthLessonListItem, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthLessons, listGrowthStudents } from '@/lib/growth-v2-store';

type GrowthV2LessonsPageProps = {
  searchParams?: {
    error?: string | string[];
    q?: string | string[];
    groupId?: string | string[];
    saved?: string | string[];
    deleted?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatNumber(value: number | null, digits = 1) {
  return value === null ? '--' : value.toFixed(digits);
}

function formatPercent(value: number | null) {
  return value === null ? '--' : `${value.toFixed(1)}%`;
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start && !end) return '--';
  if (start && end) return `${start} - ${end}`;
  return start ?? end ?? '--';
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2LessonsPage({ searchParams }: GrowthV2LessonsPageProps) {
  const error = firstValue(searchParams?.error);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const saved = firstValue(searchParams?.saved) === '1';
  const deleted = firstValue(searchParams?.deleted) === '1';
  const adminHref = '/admin/growth-v2' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/lessons',
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let lessons: GrowthLessonListItem[] = [];
  let students: GrowthStudentListItem[] = [];

  try {
    [groups, lessons, students] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthLessons({ q, groupId }),
      listGrowthStudents({ status: 'active' })
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">课堂记录模块</h1>
              <p className="mt-2 text-sm text-ink/70">课堂记录页已经接到真实数据层，但当前 Supabase 里还没有 Growth V2 相关表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/lessons" />
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

  const totalRecords = lessons.reduce((sum, lesson) => sum + lesson.recordCount, 0);
  const avgExitRateValues = lessons.flatMap((lesson) => (lesson.avgExitScoreRate === null ? [] : [lesson.avgExitScoreRate]));
  const avgPerformanceValues = lessons.flatMap((lesson) => (lesson.avgPerformance === null ? [] : [lesson.avgPerformance]));
  const overallExitRate = avgExitRateValues.length ? avgExitRateValues.reduce((sum, value) => sum + value, 0) / avgExitRateValues.length : null;
  const overallPerformance = avgPerformanceValues.length ? avgPerformanceValues.reduce((sum, value) => sum + value, 0) / avgPerformanceValues.length : null;
  const activeGroups: GrowthV2LessonFormGroup[] = groups
    .filter((group) => group.status === 'active')
    .map((group) => ({
      id: group.id,
      name: group.name,
      gradeLabel: group.gradeLabel
    }));
  const activeStudents: GrowthV2LessonFormStudent[] = students.map((student) => ({
    id: student.id,
    name: student.name,
    gradeLabel: student.gradeLabel,
    homeGroupId: student.homeGroupId,
    homeGroupName: student.homeGroup?.name ?? null
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">课堂记录模块</h1>
          <p className="mt-2 text-sm text-ink/70">这一页现在直接读取 `growth_lessons` 和 `growth_lesson_records`，展示课堂级别的汇总和列表。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回后台
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2/lessons" />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            请至少填写班组、上课日期和课堂主题；数字字段也要保证是合法数值。
          </p>
        ) : null}
        {saved ? <p className="mt-3 rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">课堂记录已保存。</p> : null}
        {deleted ? <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-700">课堂记录已删除。</p> : null}
      </div>

      <section className="mt-8">
        <GrowthV2LessonBatchForm groups={activeGroups} students={activeStudents} action={createGrowthLessonAction} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">课次数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{lessons.length}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">课堂记录数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{totalRecords}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课后得分率</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatPercent(overallExitRate)}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">平均课堂表现</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{formatNumber(overallPerformance)}</p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">课堂列表</h2>
            <p className="mt-2 text-sm text-ink/70">支持按主题关键词和班组筛选。后续会在这个页面上继续补录入和反馈表能力。</p>
          </div>
          <p className="text-sm text-ink/65">当前匹配 {lessons.length} 节课</p>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-tide/10 bg-paper/50 p-4 md:grid-cols-[1.2fr_240px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="按课堂主题搜索，例如 三角函数"
            className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select name="groupId" defaultValue={groupId} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">全部班组</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
            筛选
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">日期 / 时间</th>
                <th className="px-4 py-3 font-medium">课堂主题</th>
                <th className="px-4 py-3 font-medium">班组</th>
                <th className="px-4 py-3 font-medium">测试信息</th>
                <th className="px-4 py-3 font-medium">学生数</th>
                <th className="px-4 py-3 font-medium">调课数</th>
                <th className="px-4 py-3 font-medium">进门考均分</th>
                <th className="px-4 py-3 font-medium">课后得分率</th>
                <th className="px-4 py-3 font-medium">掌握度已填</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">
                      <p>{lesson.lessonDate}</p>
                      <p className="mt-1 text-xs text-ink/55">{formatTimeRange(lesson.timeStart, lesson.timeEnd)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{lesson.topic}</p>
                      {lesson.homework ? <p className="mt-1 text-xs text-ink/60">作业：{lesson.homework}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{lesson.group?.name ?? '--'}</td>
                    <td className="px-4 py-4 text-ink/80">
                      <p>进门考：{lesson.entryTestTopic || '--'}</p>
                      <p className="mt-1">课后测：{lesson.exitTestTopic || '--'}</p>
                      <p className="mt-1 text-xs text-ink/55">满分：{lesson.testTotal ?? '--'}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{lesson.recordCount}</td>
                    <td className="px-4 py-4 text-ink/80">{lesson.guestCount}</td>
                    <td className="px-4 py-4 text-ink/80">{formatNumber(lesson.avgEntryScore)}</td>
                    <td className="px-4 py-4 text-ink/80">{formatPercent(lesson.avgExitScoreRate)}</td>
                    <td className="px-4 py-4 text-ink/80">{lesson.masteryFilledCount}</td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/growth-v2/lessons/${lesson.id}` as Route} className="text-sm font-medium text-accent hover:underline">
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-sm text-ink/60">
                    没有找到符合条件的课堂记录。
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
