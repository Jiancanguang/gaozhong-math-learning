import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
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

  let groups = [];
  let students = [];

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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">学生档案模块</h1>
          <p className="mt-2 text-sm text-ink/70">这一页后面会对应 `growth_students` 和 `growth_groups` 两张核心表。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={adminHref} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回后台
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2/students" />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
      </div>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">学生列表</h2>
            <p className="mt-2 text-sm text-ink/70">这一页已经接到 `growth_students`、`growth_groups`、`growth_lesson_records`、`growth_exam_scores`。</p>
          </div>
          <p className="text-sm text-ink/65">当前匹配 {students.length} 名学生</p>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-tide/10 bg-paper/50 p-4 md:grid-cols-[1.2fr_220px_180px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="按姓名搜索"
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
          <select
            name="gradeLabel"
            defaultValue={gradeLabel}
            className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">全部年级</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="all">全部状态</option>
            <option value="active">在读</option>
            <option value="archived">归档</option>
          </select>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
            筛选
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
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
                  <tr key={student.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{student.name}</p>
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
                      <code className="rounded bg-paper px-2 py-1 text-xs text-tide">{student.parentAccessToken}</code>
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
