import type { Metadata } from 'next';
import Link from 'next/link';
import { listStudents } from '@/lib/score-tracker';
import { GRADE_LABELS, getDistinctGroupNames } from '@/lib/growth-tracker';

export const metadata: Metadata = {
  title: '学生管理 — 筑学工作室'
};

type Props = {
  searchParams: { group?: string; status?: string; q?: string };
};

export default async function StudentsPage({ searchParams }: Props) {
  const groupFilter = searchParams.group ?? '';
  const statusFilter = (searchParams.status ?? 'active') as 'all' | 'active' | 'archived';
  const nameFilter = searchParams.q ?? '';

  const students = await listStudents({
    q: nameFilter,
    groupName: groupFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    isActive: statusFilter === 'active' ? 'active' : statusFilter === 'archived' ? 'inactive' : 'all'
  });

  const groupNames = await getDistinctGroupNames();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gt-primary">学生管理</h1>
        <Link
          href={'/students/new' as never}
          className="rounded-xl bg-gt-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-gt-primary/90"
        >
          添加学生
        </Link>
      </div>

      {/* Filters */}
      <form className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-ink/60">搜索姓名</label>
          <input
            name="q"
            defaultValue={nameFilter}
            placeholder="输入姓名..."
            className="mt-1 w-32 rounded-lg border border-gt-primary/20 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-gt-accent"
          />
        </div>
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
        <div>
          <label className="block text-xs text-ink/60">状态</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="mt-1 rounded-lg border border-gt-primary/20 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-gt-accent"
          >
            <option value="active">在读</option>
            <option value="archived">已结课</option>
            <option value="all">全部</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gt-primary/10 px-3 py-1.5 text-sm font-medium text-gt-primary transition hover:bg-gt-primary/20"
        >
          筛选
        </button>
      </form>

      {/* Student list */}
      <div className="mt-6 space-y-3">
        {students.length === 0 ? (
          <p className="rounded-xl border border-gt-primary/10 bg-white/80 p-6 text-center text-sm text-ink/50">暂无学生数据</p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-4 rounded-xl border border-gt-primary/10 bg-white/80 p-4 transition hover:shadow-card"
            >
              <div className="flex-1 min-w-0">
                <Link href={`/students/${student.id}` as never} className="text-base font-medium text-gt-primary hover:underline">
                  {student.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink/60">
                  <span>{GRADE_LABELS[student.grade] ?? student.grade}</span>
                  {student.groupName ? <span>· {student.groupName}</span> : null}
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      student.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {student.status === 'active' ? '在读' : '已结课'}
                  </span>
                </div>
              </div>
              <CopyParentLinkButton token={student.parentToken} baseUrl={baseUrl} />
              <Link
                href={`/students/${student.id}/edit` as never}
                className="rounded-lg border border-gt-primary/20 px-3 py-1.5 text-xs text-ink/60 transition hover:text-gt-primary"
              >
                编辑
              </Link>
            </div>
          ))
        )}
      </div>
      <p className="mt-4 text-xs text-ink/40">共 {students.length} 名学生</p>
    </div>
  );
}

function CopyParentLinkButton({ token, baseUrl }: { token: string; baseUrl: string }) {
  if (!token) return null;
  const link = `${baseUrl}/report?token=${token}`;

  return (
    <button
      type="button"
      title="复制家长链接"
      data-link={link}
      className="copy-parent-link rounded-lg border border-gt-primary/20 px-3 py-1.5 text-xs text-ink/60 transition hover:text-gt-accent"
      onClick={undefined}
    >
      家长链接
    </button>
  );
}
