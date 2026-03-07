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
  const inactiveCount = tags.length - activeCount;
  const usageCount = tags.reduce((sum, tag) => sum + tag.usageCount, 0);
  const hottestTag = [...tags].sort((left, right) => right.usageCount - left.usageCount)[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-tide/10 bg-white/82 p-8 shadow-card">
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Tags</p>
            <h1 className="mt-3 text-3xl font-semibold text-tide sm:text-4xl">标签目录</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/80">
              这里维护考试薄弱点标签的分类、排序和启用状态。标签目录一旦整理好，考试录入页就会直接复用这套分类，线上数据和录入体验会一致很多。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">按分类做快捷录入</span>
              <span className="rounded-full bg-paper px-3 py-1 font-medium text-tide ring-1 ring-tide/10">支持启用 / 停用</span>
              <span className="rounded-full bg-tide/10 px-3 py-1 font-medium text-tide">引用次数可直接回看热度</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={'/admin/growth-v2/tags/new' as Route} className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent/90">
                新建标签
              </Link>
              <Link href={'/admin/growth-v2' as Route} className="rounded-xl border border-tide/20 px-5 py-3 text-sm font-medium text-tide transition hover:bg-tide/5">
                返回后台
              </Link>
              <AdminLogoutButton redirectPath="/admin/growth-v2/tags" />
            </div>
          </div>

          <div className="rounded-3xl border border-tide/10 bg-paper/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Live Snapshot</p>
                <h2 className="mt-2 text-2xl font-semibold text-tide">当前标签结构</h2>
              </div>
              <span className="rounded-full bg-[#d4f2ea] px-3 py-1 text-xs font-semibold text-[#00b894]">线上数据</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">标签总数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{tags.length}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">启用标签</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{activeCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">停用标签</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{inactiveCount}</p>
              </article>
              <article className="rounded-2xl border border-tide/10 bg-white/90 p-4">
                <p className="text-sm text-ink/60">分类数</p>
                <p className="mt-2 text-3xl font-semibold text-tide">{categories.length}</p>
              </article>
            </div>
            <div className="mt-5 rounded-2xl border border-tide/10 bg-white/80 p-4 text-sm leading-7 text-ink/75">
              当前累计引用 {usageCount} 次。{hottestTag ? `最高频的是“${hottestTag.tagName}”，已被使用 ${hottestTag.usageCount} 次。` : '标签还没有历史引用。'}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6">
        <GrowthV2AdminErrorBanner error={error} />
        {error === 'validation' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">请至少填写标签分类和标签名称，排序值不能小于 0。</p>
        ) : null}
        {error === 'duplicate' ? (
          <p className="mt-3 rounded-lg border border-[#f0932b]/30 bg-[#f7ead5] px-3 py-2 text-sm text-[#b8720a]">同一分类下标签名称不能重复，请调整后再保存。</p>
        ) : null}
        {savedTagId ? <p className="mt-3 rounded-lg border border-[#00b894]/30 bg-[#d4f2ea] px-3 py-2 text-sm text-[#00b894]">标签目录已保存。</p> : null}
      </div>

      <section className="mt-8 rounded-3xl border border-tide/10 bg-white/85 p-6 shadow-card">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Directory</p>
            <h2 className="mt-2 text-2xl font-semibold text-tide">标签列表</h2>
            <p className="mt-2 text-sm leading-7 text-ink/70">支持按分类、关键词和状态筛选。停用标签不会出现在考试录入快捷标签里，但历史引用会完整保留。</p>
          </div>
          <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-tide ring-1 ring-tide/10">当前匹配 {filteredTags.length} 个标签</span>
        </div>

        <form className="mt-6 rounded-2xl border border-tide/10 bg-paper/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-tide">筛选条件</p>
            <p className="text-xs text-ink/60">支持用分类、关键词和启停状态快速收缩目录。</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_220px_180px_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="按分类或标签名搜索"
              className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent"
            />
            <select name="category" defaultValue={category} className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent">
              <option value="">全部分类</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={statusValue} className="rounded-xl border border-tide/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-accent">
              <option value="all">全部状态</option>
              <option value="active">启用中</option>
              <option value="inactive">已停用</option>
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
                  <tr key={tag.id} className="border-b border-tide/10 align-top transition hover:bg-paper/30 last:border-b-0">
                    <td className="px-4 py-4 text-ink/80">{tag.category}</td>
                    <td className="px-4 py-4">
                      <p className="text-base font-medium text-tide">{tag.tagName}</p>
                    </td>
                    <td className="px-4 py-4 text-ink/80">{tag.sortOrder}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          tag.isActive ? 'bg-[#d4f2ea] text-[#00b894] ring-1 ring-[#00b894]/30' : 'bg-[#f3f1f5] text-[#6b6478] ring-1 ring-[#ddd8e0]'
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
