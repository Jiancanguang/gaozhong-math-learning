import type { Route } from 'next';
import Link from 'next/link';

import { PetAdminErrorBanner, renderPetAdminGate } from '@/components/pet/admin-access';
import { isPetTableMissingError, listPetClasses, getPetClassStats } from '@/lib/pet-store';

import { createClassAction, deleteClassAction } from './actions';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { error?: string | string[] };
};

export default async function PetAdminPage({ searchParams }: PageProps) {
  const error = Array.isArray(searchParams?.error) ? searchParams.error[0] : searchParams?.error;

  const gate = renderPetAdminGate({ successPath: '/admin/pet', searchError: error });
  if (gate) return gate;

  let classes: Awaited<ReturnType<typeof listPetClasses>> = [];
  let statsMap = new Map<string, Awaited<ReturnType<typeof getPetClassStats>>>();

  try {
    classes = await listPetClasses({ status: 'all' });
    const statsEntries = await Promise.all(
      classes.map(async (c) => [c.id, await getPetClassStats(c.id)] as const)
    );
    statsMap = new Map(statsEntries);
  } catch (fetchError) {
    if (isPetTableMissingError(fetchError)) {
      return (
        <div>
          <PetAdminErrorBanner error="missing-table" />
        </div>
      );
    }
    throw fetchError;
  }

  return (
    <div>
      <PetAdminErrorBanner error={error} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">班级宠物管理</h1>
      </div>

      <p className="mt-2 text-sm text-ink/60">创建班级，添加学生，给宠物喂食，管理小卖部。</p>

      {/* Create class form */}
      <form action={createClassAction} className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-ink/80">新建班级</label>
          <input
            type="text"
            name="name"
            required
            placeholder="输入班级名称，如「高一3班」"
            className="w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
          />
        </div>
        <button type="submit" className="rounded-lg bg-tide px-5 py-2 text-sm font-medium text-white transition hover:bg-tide/90">
          创建
        </button>
      </form>

      {/* Class list */}
      {classes.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-tide/20 p-10 text-center">
          <p className="text-lg text-ink/50">还没有班级</p>
          <p className="mt-1 text-sm text-ink/40">创建第一个班级开始使用宠物系统</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {classes.map((cls) => {
            const stats = statsMap.get(cls.id);
            return (
              <div key={cls.id} className="rounded-2xl border border-tide/10 bg-white/85 p-5 transition hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/admin/pet/${cls.id}` as Route} className="text-lg font-semibold text-tide hover:underline">
                      {cls.name}
                    </Link>
                    {cls.status === 'archived' && (
                      <span className="ml-2 rounded bg-ink/10 px-2 py-0.5 text-xs text-ink/50">已归档</span>
                    )}
                  </div>
                  <form action={deleteClassAction}>
                    <input type="hidden" name="id" value={cls.id} />
                    <button
                      type="submit"
                      className="text-xs text-ink/30 transition hover:text-[#e05555]"
                      onClick={(e) => {
                        if (!confirm('确定删除该班级？所有学生和记录都会被删除。')) e.preventDefault();
                      }}
                    >
                      删除
                    </button>
                  </form>
                </div>

                <div className="mt-3 flex gap-4 text-sm text-ink/60">
                  <span>{stats?.studentCount ?? 0} 名学生</span>
                  <span>平均 Lv.{stats?.avgLevel ?? 0}</span>
                  <span>累计 {stats?.totalFood ?? 0} 食物</span>
                </div>

                <Link
                  href={`/admin/pet/${cls.id}` as Route}
                  className="mt-3 inline-block rounded-lg bg-tide/10 px-4 py-1.5 text-sm font-medium text-tide transition hover:bg-tide/20"
                >
                  管理班级
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
