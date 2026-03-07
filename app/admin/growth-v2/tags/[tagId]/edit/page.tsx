import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateGrowthTagCatalogAction } from '@/app/admin/growth-v2/actions';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { GrowthV2TagCatalogForm } from '@/components/growth-v2/tag-catalog-form';
import { firstValue } from '@/lib/growth-v2-format';
import { getGrowthTagCatalogItemById, isGrowthV2TableMissingError, listGrowthTagCatalogItems } from '@/lib/growth-v2-store';

type GrowthV2EditTagPageProps = {
  params: {
    tagId: string;
  };
  searchParams?: {
    error?: string | string[];
  };
};

export const dynamic = 'force-dynamic';

export default async function GrowthV2EditTagPage({ params, searchParams }: GrowthV2EditTagPageProps) {
  const error = firstValue(searchParams?.error);
  const pageHref = `/admin/growth-v2/tags/${params.tagId}/edit` as Route;
  const gate = renderGrowthV2AdminGate({
    successPath: pageHref,
    searchError: error
  });
  if (gate) return gate;

  let tag = null;
  let categoryOptions: string[] = [];

  try {
    const [item, catalog] = await Promise.all([getGrowthTagCatalogItemById(params.tagId), listGrowthTagCatalogItems({ includeInactive: true })]);
    tag = item;
    categoryOptions = Array.from(new Set(catalog.map((entry) => entry.category).filter(Boolean))).sort((left, right) =>
      left.localeCompare(right, 'zh-CN')
    );
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">编辑标签</h1>
              <p className="mt-2 text-sm text-ink/70">标签编辑页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/tags' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回标签目录
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

  if (!tag) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">编辑标签</h1>
          <p className="mt-2 text-sm text-ink/70">这里会更新标签分类、名称、排序和启用状态，不会改动已经存在的考试记录。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/tags' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回标签目录
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">请至少填写标签分类和标签名称，排序值不能小于 0。</p>
        ) : null}
        {error === 'duplicate' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">同一分类下标签名称已存在，请换一个名称。</p>
        ) : null}
      </div>

      <div className="mt-6">
        <GrowthV2TagCatalogForm
          action={updateGrowthTagCatalogAction.bind(null, tag.id)}
          submitLabel="保存标签修改"
          cancelHref="/admin/growth-v2/tags"
          categoryOptions={categoryOptions}
          values={{
            category: tag.category,
            tagName: tag.tagName,
            sortOrder: String(tag.sortOrder),
            isActive: tag.isActive
          }}
        />
      </div>
    </>
  );
}
