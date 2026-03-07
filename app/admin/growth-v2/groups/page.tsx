import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthExamListItem, GrowthGroup, GrowthLessonListItem, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthExams, listGrowthGroups, listGrowthLessons, listGrowthStudents } from '@/lib/growth-v2-store';

type GrowthV2GroupsPageProps = {
  searchParams?: {
    error?: string | string[];
    saved?: string | string[];
    status?: string | string[];
    q?: string | string[];
  };
};

type GroupSummary = GrowthGroup & {
  studentCount: number;
  lessonCount: number;
  examCount: number;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildGroupSummaries(groups: GrowthGroup[], students: GrowthStudentListItem[], lessons: GrowthLessonListItem[], exams: GrowthExamListItem[]) {
  const studentCounts = new Map<string, number>();
  const lessonCounts = new Map<string, number>();
  const examCounts = new Map<string, number>();

  for (const student of students) {
    if (!student.homeGroupId) continue;
    studentCounts.set(student.homeGroupId, (studentCounts.get(student.homeGroupId) ?? 0) + 1);
  }

  for (const lesson of lessons) {
    lessonCounts.set(lesson.groupId, (lessonCounts.get(lesson.groupId) ?? 0) + 1);
  }

  for (const exam of exams) {
    examCounts.set(exam.groupId, (examCounts.get(exam.groupId) ?? 0) + 1);
  }

  return groups.map((group) => ({
    ...group,
    studentCount: studentCounts.get(group.id) ?? 0,
    lessonCount: lessonCounts.get(group.id) ?? 0,
    examCount: examCounts.get(group.id) ?? 0
  }));
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2GroupsPage({ searchParams }: GrowthV2GroupsPageProps) {
  const error = firstValue(searchParams?.error);
  const savedGroupId = firstValue(searchParams?.saved);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';
  const status = statusValue === 'active' || statusValue === 'archived' ? statusValue : 'all';
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/groups',
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];
  let lessons: GrowthLessonListItem[] = [];
  let exams: GrowthExamListItem[] = [];

  try {
    [groups, students, lessons, exams] = await Promise.all([
      listGrowthGroups({ status }),
      listGrowthStudents({ status: 'all' }),
      listGrowthLessons(),
      listGrowthExams()
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">班组管理</h1>
              <p className="mt-2 text-sm text-ink/70">班组管理页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/groups" />
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

  const filteredGroups = groups.filter((group) => {
    if (!q) return true;
    const haystack = [group.name, group.teacherName, group.gradeLabel, group.notes].join('\n').toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  const summaries = buildGroupSummaries(filteredGroups, students, lessons, exams);
  const activeGroupCount = summaries.filter((group) => group.status === 'active').length;
  const archivedGroupCount = summaries.length - activeGroupCount;
  const coveredTeacherCount = new Set(summaries.map((group) => group.teacherName).filter(Boolean)).size;
  const totalStudentCount = summaries.reduce((sum, group) => sum + group.studentCount, 0);
  const totalLessonCount = summaries.reduce((sum, group) => sum + group.lessonCount, 0);
  const totalExamCount = summaries.reduce((sum, group) => sum + group.examCount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/82 p-8 shadow-card">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Groups</p>
            <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">班组管理</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/80">
              这里统一维护 `growth_groups`。除了班组本身的信息，你还能直接看到每个班组下沉淀了多少学生、课堂和考试，并一键跳到对应模块继续处理。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">年级 / 老师配置已在线维护</span>
              <span className="rounded-full bg-paper px-3 py-1 font-medium text-tide ring-1 ring-tide/10">支持状态筛选和归档</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">可直达学生、课堂、考试页面</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/groups/new' as Route} className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">
                新建班组
              </Link>
              <Link href={'/admin/growth-v2' as Route} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/groups" />
            </div>
          </div>

          <div className="rounded-3xl border border-tide/10 bg-paper/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-tide">当前班组结构</h2>
              </div>
              <span className="rounded-full bg-[#d4f2ea] px-3 py-1 text-xs font-semibold text-[#00b894]">线上数据</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">班组总数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{summaries.length}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">启用中</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{activeGroupCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">已归档</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{archivedGroupCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">覆盖老师数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{coveredTeacherCount}</p>
              </article>
            </div>
            <div className="mt-5 rounded-2xl border border-tide/10 bg-white/80 p-4 text-sm leading-7 text-ink/75">
              当前班组一共沉淀了 {totalStudentCount} 名学生、{totalLessonCount} 节课堂和 {totalExamCount} 场考试，列表右侧可以直接跳转到对应结果页。
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">请至少填写班组名称。</p>
        ) : null}
        {error === 'duplicate' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">班组名称不能重复，请调整后再保存。</p>
        ) : null}
        {savedGroupId ? <p className="mt-3 rounded-lg border border-[#00b894]/30 bg-[#d4f2ea] px-3 py-2 text-sm text-[#00b894]">班组信息已保存。</p> : null}
      </div>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Directory</p>
            <h2 className="mt-2 text-2xl font-semibold text-tide">班组列表</h2>
            <p className="mt-2 text-sm leading-7 text-ink/70">支持按名称、老师和状态筛选，并直接跳到对应的学生、课堂、考试页面。这个页面更偏运营看板，而不是只放一张工具表。</p>
          </div>
          <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-tide ring-1 ring-tide/10">当前匹配 {summaries.length} 个班组</span>
        </div>

        <form className="mt-6 rounded-2xl border border-tide/10 bg-paper/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-tide">筛选条件</p>
            <p className="text-xs text-ink/60">可按班组名、老师、备注和状态快速收缩结果。</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.3fr_180px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="按班组名、老师、备注搜索"
              className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
            />
            <select name="status" defaultValue={status} className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent">
              <option value="all">全部状态</option>
              <option value="active">启用中</option>
              <option value="archived">已归档</option>
            </select>
            <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
              筛选
            </button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-tide/10 bg-white/90">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/70 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">班组</th>
                <th className="px-4 py-3 font-medium">年级</th>
                <th className="px-4 py-3 font-medium">老师</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">学生</th>
                <th className="px-4 py-3 font-medium">课堂</th>
                <th className="px-4 py-3 font-medium">考试</th>
                <th className="px-4 py-3 font-medium">快捷入口</th>
              </tr>
            </thead>
            <tbody>
              {summaries.length > 0 ? (
                summaries.map((group) => (
                  <tr key={group.id} className="border-b border-tide/10 align-top transition hover:bg-paper/30 last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-base font-medium text-tide">{group.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.gradeLabel ? (
                          <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-tide ring-1 ring-tide/10">{group.gradeLabel}</span>
                        ) : null}
                        {group.teacherName ? <span className="rounded-full bg-tide/10 px-3 py-1 text-xs font-medium text-tide">{group.teacherName}</span> : null}
                      </div>
                      {group.notes ? <p className="mt-1 text-xs text-ink/55">{group.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{group.gradeLabel || '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{group.teacherName || '--'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          group.status === 'active'
                            ? 'bg-[#d4f2ea] text-[#00b894] ring-1 ring-[#00b894]/30'
                            : 'bg-[#f3f1f5] text-[#6b6478] ring-1 ring-[#ddd8e0]'
                        }`}
                      >
                        {group.status === 'active' ? '启用中' : '已归档'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{group.studentCount}</td>
                    <td className="px-4 py-4 text-ink/80">{group.lessonCount}</td>
                    <td className="px-4 py-4 text-ink/80">{group.examCount}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/growth-v2/groups/${group.id}/edit` as Route}
                          className="inline-flex rounded-lg border border-tide/20 px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          编辑
                        </Link>
                        <Link
                          href={`/admin/growth-v2/students?groupId=${group.id}` as Route}
                          className="inline-flex rounded-lg border border-tide/20 px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          学生
                        </Link>
                        <Link
                          href={`/admin/growth-v2/lessons?groupId=${group.id}` as Route}
                          className="inline-flex rounded-lg border border-tide/20 px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          课堂
                        </Link>
                        <Link
                          href={`/admin/growth-v2/exams?groupId=${group.id}` as Route}
                          className="inline-flex rounded-lg border border-tide/20 px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          考试
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/60">
                    还没有匹配到班组。可以先新建班组，或者调整筛选条件。
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
