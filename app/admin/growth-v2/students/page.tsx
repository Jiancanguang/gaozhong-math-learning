import type { Route } from 'next';
import Link from 'next/link';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { StudentAvatar } from '@/components/growth-v2/ui/student-avatar';
import type { GrowthGroup, GrowthStudentListItem } from '@/lib/growth-v2-store';
import { firstValue } from '@/lib/growth-v2-format';
import { isGrowthV2TableMissingError, listGrowthGroups, listGrowthStudents } from '@/lib/growth-v2-store';

const CARD_ACCENT_COLORS = ['#6c5ce7', '#e17055', '#00b894', '#4a90d9', '#a29bfe', '#f0932b', '#fd79a8', '#636e72'];

type PageProps = {
  searchParams?: {
    error?: string | string[];
    q?: string | string[];
    groupId?: string | string[];
    status?: string | string[];
    gradeLabel?: string | string[];
  };
};

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const groupId = firstValue(searchParams?.groupId)?.trim() ?? '';
  const gradeLabel = firstValue(searchParams?.gradeLabel)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';
  const status = statusValue === 'active' || statusValue === 'archived' ? statusValue : 'all';

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/students', searchError: error });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let students: GrowthStudentListItem[] = [];

  try {
    [groups, students] = await Promise.all([
      listGrowthGroups({ status: 'all' }),
      listGrowthStudents({ q, groupId, status, gradeLabel })
    ]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div>
          <GrowthV2AdminErrorBanner error="missing-table" />
        </div>
      );
    }
    throw fetchError;
  }

  const gradeOptions = Array.from(new Set(students.map((s) => s.gradeLabel).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">学生管理</h1>
        <Link
          href={'/admin/growth-v2/students/new' as Route}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90"
        >
          + 添加学生
        </Link>
      </div>

      {/* Filters */}
      <form className="mt-5 rounded-xl border border-border-light bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_150px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="按姓名搜索"
            className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
          />
          <select name="groupId" defaultValue={groupId} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
            <option value="">全部班组</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select name="gradeLabel" defaultValue={gradeLabel} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
            <option value="">全部年级</option>
            {gradeOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
            <option value="all">全部状态</option>
            <option value="active">在读</option>
            <option value="archived">归档</option>
          </select>
          <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
            筛选
          </button>
        </div>
      </form>

      {/* Student Card Grid */}
      {students.length > 0 ? (
        <div className="mt-6 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {students.map((student, i) => {
            const accentColor = CARD_ACCENT_COLORS[i % CARD_ACCENT_COLORS.length];
            return (
              <div
                key={student.id}
                className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderTopWidth: 3, borderTopColor: accentColor }}
              >
                <div className="flex justify-center pt-2">
                  <StudentAvatar name={student.name} size="md" />
                </div>
                <h3 className="mt-3 text-center text-sm font-bold text-ink">{student.name}</h3>
                <p className="mt-1 text-center text-xs text-text-muted">
                  {student.gradeLabel || '--'} · {student.homeGroup?.name ?? '--'}
                </p>
                <p className="mt-2 text-center text-xs text-text-light">
                  {student.lessonCount}次课 · {student.examCount}次考试
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  <Link
                    href={`/admin/growth-v2/students/${student.id}` as Route}
                    className="rounded-lg bg-tide/10 px-2.5 py-1 text-xs font-medium text-tide transition hover:bg-tide/20"
                  >
                    详情
                  </Link>
                  <Link
                    href={`/growth-v2/parent/${student.parentAccessToken}` as Route}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-medium text-text-light transition hover:bg-border-light"
                  >
                    家长页
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border-light bg-surface py-12 text-center">
          <p className="text-lg text-text-muted">没有匹配的学生</p>
          <p className="mt-2 text-sm text-text-muted">尝试调整筛选条件或添加新学生。</p>
        </div>
      )}
    </div>
  );
}
