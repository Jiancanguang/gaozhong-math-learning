import type { Route } from 'next';
import Link from 'next/link';

import { AdminLogoutButton } from '@/components/admin-auth-panels';
import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import type { GrowthTagCatalogSummaryItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthTagCatalogSummary } from '@/lib/growth-v2-store';

type GrowthV2TagsPageProps = {
  searchParams?: {
    error?: string | string[];
    saved?: string | string[];
    q?: string | string[];
    category?: string | string[];
    status?: string | string[];
  };
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = 'force-dynamic';

export default async function GrowthV2TagsPage({ searchParams }: GrowthV2TagsPageProps) {
  const error = firstValue(searchParams?.error);
  const savedTagId = firstValue(searchParams?.saved);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const category = firstValue(searchParams?.category)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';
  const gate = renderGrowthV2AdminGate({
    successPath: '/admin/growth-v2/tags',
    searchError: error
  });
  if (gate) return gate;

  let tags: GrowthTagCatalogSummaryItem[] = [];

  try {
    tags = await listGrowthTagCatalogSummary({ includeInactive: true });
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">Growth V2</p>
              <h1 className="mt-2 text-3xl font-semibold text-tide">标签目录</h1>
              <p className="mt-2 text-sm text-ink/70">标签目录页已经接到真实数据层，但当前 Supabase 里还没有 `growth_*` 表。</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/tags" />
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

  const filteredTags = tags.filter((tag) => {
    if (statusValue === 'active' && !tag.isActive) return false;
    if (statusValue === 'inactive' && tag.isActive) return false;
    if (category && tag.category !== category) return false;
    if (!q) return true;

    const haystack = [tag.category, tag.tagName].join('\n').toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  const categories = Array.from(new Set(tags.map((tag) => tag.category).filter(Boolean))).sort((left, right) => left.localeCompare(right, 'zh-CN'));
  const activeCount = tags.filter((tag) => tag.isActive).length;
  const usageCount = tags.reduce((sum, tag) => sum + tag.usageCount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-accent">Growth V2</p>
          <h1 className="mt-2 text-3xl font-semibold text-tide">标签目录</h1>
          <p className="mt-2 text-sm text-ink/70">维护考试薄弱点标签的分类、排序和启用状态，并查看每个标签的实际使用次数。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={'/admin/growth-v2/tags/new' as Route} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
            新建标签
          </Link>
          <Link href={'/admin/growth-v2' as Route} className="rounded-lg border border-tide/20 px-4 py-2 text-sm font-medium text-tide transition hover:bg-tide/5">
            返回后台
          </Link>
          <AdminLogoutButton redirectPath="/admin/growth-v2/tags" />
        </div>
      </div>

      <div className="mt-5">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800">请至少填写标签分类和标签名称，排序值不能小于 0。</p>
        ) : null}
        {error === 'duplicate' ? (
          <p className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800">同一分类下标签名称不能重复，请调整后再保存。</p>
        ) : null}
        {savedTagId ? <p className="mt-3 rounded-lg border border-emerald-300/70 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">标签目录已保存。</p> : null}
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">标签总数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{tags.length}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">启用标签</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{activeCount}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">分类数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{categories.length}</p>
        </article>
        <article className="rounded-2xl border border-tide/10 bg-white/90 p-5 shadow-card">
          <p className="text-sm text-ink/65">累计引用次数</p>
          <p className="mt-2 text-3xl font-semibold text-tide">{usageCount}</p>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-tide/10 bg-white/90 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-tide">标签列表</h2>
            <p className="mt-2 text-sm text-ink/70">支持按分类、关键词和状态筛选。停用标签不会出现在考试录入快捷标签里。</p>
          </div>
          <p className="text-sm text-ink/65">当前匹配 {filteredTags.length} 个标签</p>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-tide/10 bg-paper/50 p-4 md:grid-cols-[1.2fr_220px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="按分类或标签名搜索"
            className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <select name="category" defaultValue={category} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="">全部分类</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={statusValue} className="rounded-lg border border-tide/20 bg-white px-3 py-2 text-sm outline-none focus:border-accent">
            <option value="all">全部状态</option>
            <option value="active">启用中</option>
            <option value="inactive">已停用</option>
          </select>
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
            筛选
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-tide/10 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-tide/10 bg-paper/60 text-left text-ink/70">
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">标签</th>
                <th className="px-4 py-3 font-medium">排序</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">引用次数</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <tr key={tag.id} className="border-b border-tide/10 align-top last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">{tag.category}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-tide">{tag.tagName}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{tag.sortOrder}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          tag.isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                        }`}
                      >
                        {tag.isActive ? '启用中' : '已停用'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{tag.usageCount}</td>
                    <td className="px-4 py-4">
                      <Link href={`/admin/growth-v2/tags/${tag.id}/edit` as Route} className="text-sm font-medium text-accent hover:underline">
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink/60">
                    还没有匹配到标签。可以先新建，或者调整筛选条件。
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
