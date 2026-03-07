import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateGrowthGroupAction } from '@/app/admin/growth-v2/actions';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2GroupForm } from '@/components/growth-v2/group-form';
import { getGrowthGroupById, isGrowthV2TableMissingError } from '@/lib/growth-v2-store';

type GrowthV2EditGroupPageProps = {
  params: {
    groupId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2EditGroupPage({ params, searchParams }: GrowthV2EditGroupPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = `/admin/growth-v2/groups/${params.groupId}/edit` as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let group = null;

  try {
    group = await getGrowthGroupById(params.groupId);
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">编辑班组</h1>
              <p className="mt-2 text-sm text-ink/70">班组编辑页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/groups' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回班组列表
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

  if (!group) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">编辑班组</h1>
          <p className="mt-2 text-sm text-ink/70">这里会更新班组名称、老师、年级、状态和备注，不会修改历史课堂与考试数据。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/groups' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回班组列表
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">请至少填写班组名称。</p>
        ) : null}
        {error === 'duplicate' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">班组名称已存在，请换一个名称。</p>
        ) : null}
      </div>

      <div className="mt-6">
        <GrowthV2GroupForm
          action={updateGrowthGroupAction.bind(null, group.id)}
          submitLabel="保存班组修改"
          cancelHref="/admin/growth-v2/groups"
          values={{
            name: group.name,
            teacherName: group.teacherName,
            gradeLabel: group.gradeLabel,
            status: group.status,
            notes: group.notes
          }}
        />
      </div>
    </>
  );
}
