import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateGrowthStudentAction } from '@/app/admin/growth-v2/actions';
import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2StudentForm } from '@/components/growth-v2/student-form';
import type { GrowthGroup } from '@/lib/growth-v2-store';
import { getGrowthStudentById, isGrowthV2TableMissingError, listGrowthGroups } from '@/lib/growth-v2-store';

type GrowthV2EditStudentPageProps = {
  params: {
    studentId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildGradeOptions(groups: GrowthGroup[], currentGradeLabel: string) {
  return Array.from(new Set(['高一', '高二', '高三', currentGradeLabel, ...groups.map((group) => group.gradeLabel).filter(Boolean)])).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2EditStudentPage({ params, searchParams }: GrowthV2EditStudentPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = `/admin/growth-v2/students/${params.studentId}/edit` as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];
  let student = null;

  try {
    [groups, student] = await Promise.all([listGrowthGroups({ status: 'all' }), getGrowthStudentById(params.studentId)]);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">编辑学生</h1>
              <p className="mt-2 text-sm text-ink/70">学生编辑页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/admin/growth-v2/students/${params.studentId}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回学生详情
              </Link>
              <AdminLogoutButton redirectPath={pageHref} />
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

  if (!student) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">编辑学生</h1>
          <p className="mt-2 text-sm text-ink/70">这里会更新学生档案、班组归属、状态和备注，不改动历史课堂与考试记录。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/growth-v2/students/${student.id}` as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回学生详情
          </Link>
          <AdminLogoutButton redirectPath={pageHref} />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">请至少填写学生姓名和年级标签。</p>
        ) : null}
      </div>

      <div className="mt-6">
        <GrowthV2StudentForm
          action={updateGrowthStudentAction.bind(null, student.id)}
          submitLabel="保存修改"
          cancelHref={`/admin/growth-v2/students/${student.id}`}
          groups={groups.map((group) => ({ id: group.id, name: group.name, gradeLabel: group.gradeLabel }))}
          gradeOptions={buildGradeOptions(groups, student.gradeLabel)}
          values={{
            name: student.name,
            gradeLabel: student.gradeLabel,
            homeGroupId: student.homeGroupId ?? '',
            status: student.status,
            notes: student.notes,
            parentAccessToken: student.parentAccessToken
          }}
        />
      </div>
    </div>
  );
}
