import type { Route } from 'next';
import Link from 'next/link';

import { GrowthV2AdminErrorBanner, renderGrowthV2AdminGate } from '@/components/growth-v2/admin-access';
import { SectionTitle } from '@/components/growth-v2/ui/section-title';
import { StatCard } from '@/components/growth-v2/ui/stat-card';
import type { GrowthTagCatalogSummaryItem } from '@/lib/growth-v2-store';
import { isGrowthV2TableMissingError, listGrowthTagCatalogSummary } from '@/lib/growth-v2-store';

type PageProps = { searchParams?: { error?: string | string[]; saved?: string | string[]; q?: string | string[]; category?: string | string[]; status?: string | string[] } };

function firstValue(v?: string | string[]) { return Array.isArray(v) ? v[0] : v; }

export const dynamic = 'force-dynamic';

export default async function TagsPage({ searchParams }: PageProps) {
  const error = firstValue(searchParams?.error);
  const savedTagId = firstValue(searchParams?.saved);
  const q = firstValue(searchParams?.q)?.trim() ?? '';
  const category = firstValue(searchParams?.category)?.trim() ?? '';
  const statusValue = firstValue(searchParams?.status)?.trim() ?? 'all';

  const gate = renderGrowthV2AdminGate({ successPath: '/admin/growth-v2/tags', searchError: error });
  if (gate) return gate;

  let tags: GrowthTagCatalogSummaryItem[] = [];
  try {
    tags = await listGrowthTagCatalogSummary({ includeInactive: true });
  } catch (fetchError) {
    if (isGrowthV2TableMissingError(fetchError)) return <GrowthV2AdminErrorBanner error="missing-table" />;
    throw fetchError;
  }

  const filtered = tags.filter((t) => {
    if (statusValue === 'active' && !t.isActive) return false;
    if (statusValue === 'inactive' && t.isActive) return false;
    if (category && t.category !== category) return false;
    if (!q) return true;
    return [t.category, t.tagName].join('\n').toLowerCase().includes(q.toLowerCase());
  });

  const categories = Array.from(new Set(tags.map((t) => t.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const activeCount = tags.filter((t) => t.isActive).length;
  const usageCount = tags.reduce((s, t) => s + t.usageCount, 0);

  return (
    <div>
      <GrowthV2AdminErrorBanner error={error} />
      {error === 'validation' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">请至少填写标签分类和标签名称。</p> : null}
      {error === 'duplicate' ? <p className="mb-3 rounded-lg border border-stat-amber/30 bg-stat-amber-soft px-3 py-2 text-sm text-stat-amber">同一分类下标签名称不能重复。</p> : null}
      {savedTagId ? <p className="mb-3 rounded-lg border border-stat-emerald/30 bg-stat-emerald-soft px-3 py-2 text-sm text-stat-emerald">标签目录已保存。</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">标签目录</h1>
        <Link href={'/admin/growth-v2/tags/new' as Route} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent/90">
          + 新建标签
        </Link>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="标签总数" value={String(tags.length)} sub="全部标签" colorClass="bg-stat-blue-soft" valueColorClass="text-stat-blue" />
        <StatCard label="启用中" value={String(activeCount)} sub="可用标签" colorClass="bg-stat-emerald-soft" valueColorClass="text-stat-emerald" />
        <StatCard label="分类数" value={String(categories.length)} sub="不同分类" colorClass="bg-stat-amber-soft" valueColorClass="text-stat-amber" />
        <StatCard label="累计引用" value={String(usageCount)} sub="被使用次数" colorClass="bg-stat-rose-soft" valueColorClass="text-stat-rose" />
      </section>

      <section className="mt-10">
        <SectionTitle title="标签列表" />
        <form className="mt-4 rounded-xl border border-border-light bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_150px_auto]">
            <input type="text" name="q" defaultValue={q} placeholder="按分类或标签名搜索" className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide" />
            <select name="category" defaultValue={category} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="">全部分类</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="status" defaultValue={statusValue} className="rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide">
              <option value="all">全部状态</option>
              <option value="active">启用中</option>
              <option value="inactive">已停用</option>
            </select>
            <button type="submit" className="rounded-lg bg-tide px-4 py-2 text-sm font-medium text-white transition hover:bg-tide/90">筛选</button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border-light bg-surface shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border-light bg-surface-alt text-left text-xs font-bold uppercase tracking-wider text-text-light">
                <th className="px-4 py-3">分类</th>
                <th className="px-4 py-3">标签</th>
                <th className="px-4 py-3">排序</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">引用次数</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((t, i) => (
                <tr key={t.id} className={`border-b border-border-light last:border-b-0 ${i % 2 === 1 ? 'bg-tide/[0.03]' : ''}`}>
                  <td className="px-4 py-3.5 text-text-light">{t.category}</td>
                  <td className="px-4 py-3.5 font-medium text-ink">{t.tagName}</td>
                  <td className="px-4 py-3.5 text-text-light">{t.sortOrder}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.isActive ? 'bg-stat-emerald-soft text-stat-emerald' : 'bg-surface-alt text-text-muted'}`}>
                      {t.isActive ? '启用中' : '已停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-text-light">{t.usageCount}</td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/growth-v2/tags/${t.id}/edit` as Route} className="text-sm font-medium text-tide hover:underline">编辑</Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-text-muted">没有匹配的标签。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
