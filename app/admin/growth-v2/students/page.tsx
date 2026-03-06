import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthGroup, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents } from '@/lib/growth-v2-store';

type GrowthV2StudentsPageProps = {
  searchParams?: {
    error?: string | string[];
    q?: string | string[];
    groupId?: string | string[];
    status?: string | string[];
    gradeLabel?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2StudentsPage({ searchParams }: GrowthV2StudentsPageProps) {
  const error = firstValue(searchParams?.error);
  const adminHref = '/admin/growth-v2' as Route;
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const gradeLabel = firstValue(searchParams?.gradeLabel)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';
  const status = statusValue === 'active' || statusValue === 'archived' ? statusValue : 'all';
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/students',
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];

  try {
    [groups, students] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthStudents({
        q,
        groupId,
        status,
        gradeLabel
      })
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">学生档案模块</h1>
              <p className="mt-2 text-sm text-ink/70">学生档案页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/students" />
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

  const gradeOptions = Array.from(new Set(students.map((student) => student.gradeLabel).filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
  const activeStudentCount = students.filter((student) => student.status === 'active').length;
  const archivedStudentCount = students.length - activeStudentCount;
  const parentReadyCount = students.filter((student) => Boolean(student.parentAccessToken)).length;
  const groupedStudentCount = students.filter((student) => Boolean(student.homeGroupId)).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/82 p-8 shadow-card">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Student Files</p>
            <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">学生档案</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/80">
              这页已经直接接到 `growth_students`、`growth_groups`、`growth_lesson_records` 和 `growth_exam_scores`。你可以从这里查学生、改档案、看家长页入口，也能顺着记录继续追到课堂和考试详情。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">家长页 Token 已联通</span>
              <span className="rounded-full bg-paper px-3 py-1 font-medium text-tide ring-1 ring-tide/10">在读 / 归档状态已区分</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">支持按班组、年级和关键词筛选</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={'/admin/growth-v2/students/new' as Route}
                className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90"
              >
                新建学生
              </Link>
              <Link href={adminHref} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/students" />
            </div>
          </div>

          <div className="rounded-3xl border border-tide/10 bg-paper/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-tide">当前档案概况</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">线上数据</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">学生总数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{students.length}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">在读人数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{activeStudentCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">归档人数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{archivedStudentCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">已绑定班组</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{groupedStudentCount}</p>
              </article>
            </div>
            <div className="mt-5 rounded-2xl border border-tide/10 bg-white/80 p-4 text-sm leading-7 text-ink/75">
              当前有 {parentReadyCount} 名学生已经生成家长页链接，点开学生详情或列表右侧即可直接验证线上家长视图。
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Directory</p>
            <h2 className="mt-2 text-2xl font-semibold text-tide">学生列表</h2>
            <p className="mt-2 text-sm leading-7 text-ink/70">列表里保留了学生详情、编辑入口、家长页 Token，以及课堂 / 考试记录数量，方便你从档案页继续往下追踪。</p>
          </div>
          <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-tide ring-1 ring-tide/10">当前匹配 {students.length} 名学生</span>
        </div>

        <form className="mt-6 rounded-2xl border border-tide/10 bg-paper/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-tide">筛选条件</p>
            <p className="text-xs text-ink/60">支持按姓名、班组、年级和状态交叉筛选。</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_220px_180px_180px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="按姓名搜索"
              className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
            />
            <select name="groupId" defaultValue={groupId} className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent">
              <option value="">全部班组</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <select
              name="gradeLabel"
              defaultValue={gradeLabel}
              className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
            >
              <option value="">全部年级</option>
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={status} className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent">
              <option value="all">全部状态</option>
              <option value="active">在读</option>
              <option value="archived">归档</option>
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
                <th className="px-4 py-3 font-medium">学生</th>
                <th className="px-4 py-3 font-medium">年级</th>
                <th className="px-4 py-3 font-medium">常驻班组</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">课堂记录数</th>
                <th className="px-4 py-3 font-medium">考试记录数</th>
                <th className="px-4 py-3 font-medium">家长 Token</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-tide/10 align-top transition hover:bg-paper/30 last:border-b-0">
                    <td className="px-4 py-4">
                      <Link href={`/admin/growth-v2/students/${student.id}` as Route} className="text-base font-medium text-tide hover:underline">
                        {student.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {student.gradeLabel ? (
                          <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-tide ring-1 ring-tide/10">{student.gradeLabel}</span>
                        ) : null}
                        {student.homeGroup?.name ? (
                          <span className="rounded-full bg-tide/10 px-3 py-1 text-xs font-medium text-tide">{student.homeGroup.name}</span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/growth-v2/students/${student.id}/edit` as Route}
                          className="inline-flex rounded-lg border border-tide/20 px-2 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          编辑档案
                        </Link>
                      </div>
                      {student.notes ? <p className="mt-1 text-xs text-ink/55">{student.notes}</p> : null}
                    </td>
                    <td className="px-4 py-4 text-ink/80">{student.gradeLabel || '--'}</td>
                    <td className="px-4 py-4 text-ink/80">{student.homeGroup?.name ?? '--'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          student.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                            : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {student.status === 'active' ? '在读' : '归档'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{student.lessonCount}</td>
                    <td className="px-4 py-4 text-ink/80">{student.examCount}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <code className="block rounded-xl bg-paper px-2 py-1 text-xs text-tide">{student.parentAccessToken}</code>
                        <Link
                          href={`/growth-v2/parent/${student.parentAccessToken}` as Route}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-xl border border-tide/20 px-3 py-1 text-xs font-medium text-tide transition hover:bg-tide/5"
                        >
                          打开家长页
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink/60">
                    还没有 Growth V2 学生数据。先导入 JSON，或者调整筛选条件。
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
