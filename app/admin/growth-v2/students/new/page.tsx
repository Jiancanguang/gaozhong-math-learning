import type { Route } from 'next';
import Link from 'next/link';

import { createGrowthStudentAction } from '@/app/admin/growth-v2/actions';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2StudentForm } from '@/components/growth-v2/student-form';
import type { GrowthGroup } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthGroups } from '@/lib/growth-v2-store';

type GrowthV2NewStudentPageProps = {
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildGradeOptions(groups: GrowthGroup[]) {
  return Array.from(new Set(['高一', '高二', '高三', ...groups.map((group) => group.gradeLabel).filter(Boolean)])).sort((left, right) =>
    left.localeCompare(right, 'zh-CN')
  );
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2NewStudentPage({ searchParams }: GrowthV2NewStudentPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = '/admin/growth-v2/students/new' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let groups: GrowthGroup[] = [];

  try {
    groups = await listGrowthGroups({ status: 'all' });
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">新建学生</h1>
              <p className="mt-2 text-sm text-ink/70">学生创建页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/students' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回学生列表
              </Link>
            </div>
          </div>

          <div className="mt-5">
            <GrowthV2AdminErrorBanner error="missing-table" />
          </div>
        </>
      );
    }

    throw fetchError;
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">新建学生</h1>
          <p className="mt-2 text-sm text-ink/70">直接写入 `growth_students`，保存后自动生成家长访问 Token。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/students' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回学生列表
          </Link>
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
          action={createGrowthStudentAction}
          submitLabel="保存学生信息"
          cancelHref="/admin/growth-v2/students"
          groups={groups.map((group) => ({ id: group.id, name: group.name, gradeLabel: group.gradeLabel }))}
          gradeOptions={buildGradeOptions(groups)}
        />
      </div>
    </>
  );
}
