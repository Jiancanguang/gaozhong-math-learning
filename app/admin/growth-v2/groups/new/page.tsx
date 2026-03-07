import type { Route } from 'next';
import Link from 'next/link';

import { createGrowthGroupAction } from '@/app/admin/growth-v2/actions';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2GroupForm } from '@/components/growth-v2/group-form';

type GrowthV2NewGroupPageProps = {
  searchParams?: {
    error?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default function GrowthV2NewGroupPage({ searchParams }: GrowthV2NewGroupPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = '/admin/growth-v2/groups/new' as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">新建班组</h1>
          <p className="mt-2 text-sm text-ink/70">这里会直接写入 `growth_groups`，供学生、课堂和考试模块复用。</p>
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
        <GrowthV2GroupForm action={createGrowthGroupAction} submitLabel="保存班组" cancelHref="/admin/growth-v2/groups" />
      </div>
    </>
  );
}
